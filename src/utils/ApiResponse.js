class ApiResponse {
    constructor(StatusCode, data, message ="Success") {
        this.StatusCode = StatusCode
        this.data = data
        this.message = message
        this.Success = StatusCode < 400
    }
}

export { ApiResponse }