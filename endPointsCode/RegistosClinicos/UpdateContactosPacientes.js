exports = async function(arg){
  try {  
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");
  
    const updateTelefoneResult = await collection.updateMany(
      { $or: [{ Telefone: { $exists: false } }, { Telefone: "" }] },
      { $set: { Telefone: "não fornecido" } }
    );

    const updateEmailResult = await collection.updateMany(
      { Email: "desconhecido" },
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