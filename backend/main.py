from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from schemas import StudentProfile, ChatRequest
import asyncio
from top_profession import get_top_profession
from uuid import uuid4

session_store: dict[str, str] = {}
FRONTEND_BUILD_DIR = (Path(__file__).resolve().parent.parent / 'frontend' / 'build').resolve()

app = FastAPI(title='IT Career Advisor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], 
    allow_methods=['*'],
    allow_headers=['*'],
)

classifier = None
demand = None
skill_matcher = None
course_finder = None
llm = None


def get_classifier():
    global classifier
    if classifier is None:
        from services.classifier import ClassifierService

        classifier = ClassifierService()
    return classifier


def get_demand():
    global demand
    if demand is None:
        from services.demand import DemandService

        demand = DemandService()
    return demand


def get_skill_matcher():
    global skill_matcher
    if skill_matcher is None:
        from services.skill_matcher import SkillMatcherService

        skill_matcher = SkillMatcherService()
    return skill_matcher


def get_course_finder():
    global course_finder
    if course_finder is None:
        from services.course_finder import CourseFinderService

        course_finder = CourseFinderService()
    return course_finder


def get_llm():
    global llm
    if llm is None:
        from services.llm import LLMService

        llm = LLMService()
    return llm


def is_llm_not_configured_error(error: Exception) -> bool:
    return error.__class__.__name__ == "LLMNotConfiguredError"


def _get_frontend_asset(full_path: str) -> Path | None:
    candidate = (FRONTEND_BUILD_DIR / full_path).resolve()
    try:
        candidate.relative_to(FRONTEND_BUILD_DIR)
    except ValueError:
        return None

    if candidate.is_file():
        return candidate
    return None


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/recommend')
def recommend(profile: StudentProfile):
    try:
        skill_matcher_service = get_skill_matcher()
        classifier_service = get_classifier()
        demand_service = get_demand()
        course_finder_service = get_course_finder()
        llm_service = get_llm()

        # 1. Skill Matcher
        skill_scores = skill_matcher_service.get_scores(profile.skills)

        # 2. Classifier 
        profile_dict = profile.model_dump(exclude={'skills'})
        classification_scores = classifier_service.get_scores(profile_dict)

        # 3. Demand
        demand_scores = demand_service.get_scores()

        # 4. Weighted scoring to get top profession + alternative
        top_profession, final_scores, top_2 = get_top_profession(
            classification_scores=classification_scores,
            demand_scores=demand_scores,
            skill_scores=skill_scores
        )

        # 5. Personalized roadmap + courses
        roadmap_with_courses, full_roadmap = course_finder_service.get_roadmap_with_courses(
            profession=top_profession,
            student_skills=profile.skills,
            lang=profile.lang,
        )

        # 6. LLM Context Building
        context = llm_service.build_context(
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
    llm_service = get_llm()
    try:
        response = llm_service.chat(
            context=context,
            history=request.history,
            message=request.message,
        )
        return {'response': response}
    except Exception as e:
        if is_llm_not_configured_error(e):
            raise HTTPException(status_code=503, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/chat/stream')
async def chat_stream(request: ChatRequest):
    '''Generate a streaming response from the LLM, yielding chunks of text as they are generated. If `deep` is True, include the model's thoughts in the stream.'''
    context = session_store.get(request.session_id, "No context available.")
    llm_service = get_llm()
    try:
        llm_service.ensure_configured()
    except Exception as e:
        if is_llm_not_configured_error(e):
            raise HTTPException(status_code=503, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    async def generate():
        try:
            loop = asyncio.get_event_loop()
            queue = asyncio.Queue()

            def run_stream():
                try:
                    for chunk in llm_service.chat_stream(
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


@app.get('/', include_in_schema=False)
def serve_frontend():
    index_path = FRONTEND_BUILD_DIR / 'index.html'
    if not index_path.exists():
        raise HTTPException(
            status_code=404,
            detail='Frontend build not found. Build frontend or run it separately.',
        )
    return FileResponse(index_path)


@app.get('/{full_path:path}', include_in_schema=False)
def serve_frontend_routes(full_path: str):
    index_path = FRONTEND_BUILD_DIR / 'index.html'
    if not index_path.exists():
        raise HTTPException(
            status_code=404,
            detail='Frontend build not found. Build frontend or run it separately.',
        )

    asset_path = _get_frontend_asset(full_path)
    if asset_path:
        return FileResponse(asset_path)
    return FileResponse(index_path)
