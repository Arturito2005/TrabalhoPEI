exports = async function(request, response) {
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
    
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const data_registo_min = new Date(ano, mes - 1, 1);
    const data_registo_max = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const updateTelefoneResult = await collection.updateMany({
        $and: [
          { Data_Registo: { $gte: data_registo_min, $lte: data_registo_max } },
          { $or: [{ Telefone: { $exists: false } }, { Telefone: "" }] }
        ]
      },
      { $set: { Telefone: "não fornecido" } }
    );
    
    const updateEmailResult = await collection.updateMany(
      {
        $and: [
          { Data_Registo: { $gte: data_registo_min, $lte: data_registo_max } },
          { Email: "desconhecido" }
        ]
      },
      { $set: { Email: "não fornecido" } }
    );

    return {
      status: 200,
      message: "Atualização concluída.",
      detalhes: {
        telefonesAtualizados: updateTelefoneResult.modifiedCount,
        emailsAtualizados: updateEmailResult.modifiedCount,
      }
    };

  } catch (error) {
    return { 
        status: 500, 
        error: "Erro ao tentar atualizar os contactos dos Pacientes.", 
        details: error.message 
    };
  }
};