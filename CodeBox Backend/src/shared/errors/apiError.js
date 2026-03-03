export class ApiError extends Error {
   constructor(status, code, message, meta = null) {
      super(message);
      this.status = status;
      this.code = code;
      this.meta = meta;
   }
}