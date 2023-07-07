const FunctionName = async (request, reply) => {
    
    const { limit, offset, orderField, orderType, search } = request.query
    let order = ['id', 'ASC']
    let where = {}

    if(orderField && orderType) {
        order = [orderField, orderType]
    }
    
    search_fields_all
    //TODO: add relation tables in query
    const TableName = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()
    
    const totalRows = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getCount()


    return OkResponse({
        data : TableName,
        meta: {
            total: totalRows,
            limit,
            offset
        }
    }, reply)
}