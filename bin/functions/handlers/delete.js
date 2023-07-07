const FunctionName = async (request, reply) => {
    const { id } = request.params
    await ModuleName.delete({ id: id })

    return OkResponse({}, reply)
}