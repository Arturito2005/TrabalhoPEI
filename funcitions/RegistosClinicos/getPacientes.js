exports = async function(request, response){
  try {
    const ano = parseInt(request.query.ano, 10);
    const mes = parseInt(request.query.mes, 10);
    
    if(mes < 0 || mes > 12) {
      return { 
        status: 400, 
        message: "O campo mes deve ser um numero entre 0 e 12", 
      };
    }

    const data_atual = new Date();
    const ano_atual = data_atual.getFullYear();
    
    if(ano < 1500 || ano > ano_atual) {
      return { 
        status: 400, 
        message: "O parametro ano deve ser inferior a 1500 e superior ao ano atual (" + ano_atual + ")", 
      };
    } 
    
    await context.functions.execute("updateContactosPacientes", request, response);

    await context.functions.execute("updateTipoPaciente", request, response);
    
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const data_registo_min = new Date(ano, mes - 1, 1);
    const data_registo_max = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const pacientes = await collection.find({Data_Registo: {
                                              $gte: data_registo_min,
                                              $lte: data_registo_max 
                                              }}, {_id: 0,
                                                 ID_Paciente: 1, 
                                                 Nome_Completo: 1, 
                                                 Data_Nascimento: 1, 
                                                 Género: 1, 
                                                 Email: 1, 
                                                 Telefone: 1, 
                                                 Tipo_Paciente: 1}).toArray();

    return pacientes;
  } catch (error) {
    return { 
        status: 500, 
        error: "Erro a consultar pelos pacientes.", 
        details: error.message 
    };
  }
};