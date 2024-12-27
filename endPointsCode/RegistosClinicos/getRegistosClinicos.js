exports = async function(arg) {
  try {
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("AmostraRegistosClinicos");
      
    const registosClinicos = await collection.find({}, {_id: 0,
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