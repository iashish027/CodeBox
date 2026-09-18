class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, meta: object | None = None):
        self.status = status
        self.code = code
        self.message = message
        self.meta = meta
        super().__init__(message)
