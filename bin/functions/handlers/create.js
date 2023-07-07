const FunctionName = async (request, reply) => {
    const { field_list_all } = request.body
    
    const createModel = ModuleName.create({
        field_list_enter
    })
    
    const insertData = await ModuleName.insert(createModel)

    return OkResponse({
        id : insertData.raw.insertId || false
    }, reply)
}