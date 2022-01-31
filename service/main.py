from fastapi import FastAPI

app = FastAPI(title="Demo Service")


@app.get("/")
def get_message():
    return {"message": "Just a demo!"}
