from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import StudentProfile, ChatRequest
from services.classifier import ClassifierService
from fastapi.responses import StreamingResponse
from services.demand import DemandService
from services.skill_matcher import SkillMatcherService
from services.course_finder import CourseFinderService
from services.llm import LLMService
import asyncio
from top_profession import get_top_profession
from uuid import uuid4
from roadmap import generate_roadmap

session_store: dict[str, str] = {}

app = FastAPI(title='IT Career Advisor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], 
    allow_methods=['*'],
    allow_headers=['*'],
)

classifier    = ClassifierService()
demand        = DemandService()
skill_matcher = SkillMatcherService()
course_finder = CourseFinderService()
llm           = LLMService()


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/recommend')
def recommend(profile: StudentProfile):
    try:
        # 1. Skill Matcher
        skill_scores = skill_matcher.get_scores(profile.skills)

        # 2. Classifier 
        profile_dict = profile.dict(exclude={'skills'})
        classification_scores = classifier.get_scores(profile_dict)

        # 3. Demand
        demand_scores = demand.get_scores()

        # 4. Weighted scoring to get top profession + alternative
        top_profession, final_scores, top_2 = get_top_profession(
            classification_scores=classification_scores,
            demand_scores=demand_scores,
            skill_scores=skill_scores
        )

        # 5. Personalized roadmap + courses
        roadmap_with_courses, full_roadmap = course_finder.get_roadmap_with_courses(
            profession=top_profession,
            student_skills=profile.skills,
            lang=profile.lang,
        )

        # 6. LLM Context Building
        context = llm.build_context(
            skills=profile.skills,
            skill_scores=skill_scores,
            classification_scores=classification_scores,
            demand_scores=demand_scores,
            roadmap_with_courses=roadmap_with_courses,
        )
        session_id = str(uuid4())
        session_store[session_id] = context

        return {
            'top_profession':        top_profession,
            'session_id':            session_id,
            'alternative_profession': top_2[1],  
            'final_scores':         final_scores,
            'skill_scores':          skill_scores,
            'classification_scores': classification_scores,
            'demand_scores':         demand_scores,
            'roadmap_with_courses':  roadmap_with_courses,
            'full_roadmap':          full_roadmap,
            'context':               context,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/chat')
def chat(request: ChatRequest):
    '''Generate a response from the LLM based on the provided context, conversation history, and user message.'''
    context = session_store.get(request.session_id, "No context available.")
    try:
        response = llm.chat(
            context=context,
            history=request.history,
            message=request.message,
        )
        return {'response': response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/chat/stream')
async def chat_stream(request: ChatRequest):
    '''Generate a streaming response from the LLM, yielding chunks of text as they are generated. If `deep` is True, include the model's thoughts in the stream.'''
    context = session_store.get(request.session_id, "No context available.")

    async def generate():
        try:
            loop = asyncio.get_event_loop()
            queue = asyncio.Queue()

            def run_stream():
                try:
                    for chunk in llm.chat_stream(
                        context=context,
                        history=request.history,
                        message=request.message,
                        deep=request.deep
                    ):
                        loop.call_soon_threadsafe(queue.put_nowait, chunk)
                except Exception as e:
                    loop.call_soon_threadsafe(queue.put_nowait, f"__ERROR__: {e}")
                finally:
                    loop.call_soon_threadsafe(queue.put_nowait, None)

            loop.run_in_executor(None, run_stream)

            while True:
                chunk = await queue.get()
                if chunk is None:
                    yield "data: [DONE]\n\n"
                    break
                yield f"data: {chunk}\n\n"
                await asyncio.sleep(0)

        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",  
        }
    )