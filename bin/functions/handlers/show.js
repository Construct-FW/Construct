const FunctionName = async (request, reply) => {

    const { id } = request.params
    const ModuleNameLower = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where({ id })
        .getOne()

    if(!ModuleNameLower) {
        return ErrorResponse('ModuleNameLower_not_found', reply)
    } else {
        return OkResponse({
            data: ModuleNameLower
        }, reply)
    }
}