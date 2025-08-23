 class Apiresponse {
constructor(statusCode , data , message = "Success"){
        this.statusCode = statusCode,
        this.message = message,
        this.data = data,
        this.succecc= statusCode < 400

    }
}
export {Apiresponse}