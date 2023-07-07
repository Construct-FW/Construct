const FunctionName = async (request, reply) => {

    const { id } = request.params
    const { field_list_all } = request.body
    
    const updateModel = await ModuleName.findOneBy({ id: id })

    update_field_area
    await ModuleName.save(updateModel)

    return OkResponse({
        data: updateModel
    }, reply)
}