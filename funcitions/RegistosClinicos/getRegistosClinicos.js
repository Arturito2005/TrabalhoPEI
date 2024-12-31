exports = async function(request, response) {
  try {
    const ano = parseInt(request.query.ano, 10);
    const mes = parseInt(request.query.mes, 10);
    
    if(mes < 1 || mes > 12) {
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
    
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("AmostraRegistosClinicos");

    const data_atend_min = new Date(ano, mes - 1, 1);
    const data_atend_max = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const registosClinicos = await collection.find({Data_Atendimento: {
                                                    $gte: data_atend_min,
                                                    $lte: data_atend_max 
                                                    }}, {_id: 0,
                                                        ID_Atendimento: 1, 
                                                        Data_Atendimento: 1, 
                                                        ID_Profissional: 1, 
                                                        Especialidade: 1, 
                                                        Diagnosticos: 1, 
                                                        "Tratamentos.ID_Tratamento": 1,
                                                        "Tratamentos.Tipo_Tratamento": 1,
                                                        "Tratamentos.Realizado": 1,}).toArray();
    
    return registosClinicos;
  } catch (error) {
      return { 
        status: 500, 
        error: "Erro a consultar pelos Registos Clinicos.", 
        details: error.message 
      };
  }
};