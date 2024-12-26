exports = async function(arg){
  try {
    context.functions.execute("UpdateTipoPaciente", arg);

    context.functions.execute("UpdateContactosPacientes", arg);
  
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");
    
    const pacientes = await collection.find({}, {_id: 0,
                                                 ID_Paciente: 1, 
                                                 Nome_Completo: 1, 
                                                 Data_Nascimento: 1, 
                                                 Género: 1, 
                                                 Email: 1, 
                                                 Telefone: 1, 
                                                 Tipo_Paciente: 1}).toArray();

    return pacientes;
  } catch (error) {
    console.error("Erro ao executar as funções:", error.message);
    throw new Error("Erro ao executar as funções de atualização.");
  }
};