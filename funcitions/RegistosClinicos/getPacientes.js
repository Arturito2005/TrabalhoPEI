exports = async function(arg){
  try {
    await context.functions.execute("updateContactosPacientes", arg);

    await context.functions.execute("updateTipoPaciente", arg);
    
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
    return { 
        status: 500, 
        error: "Erro a consultar pelos pacientes.", 
        details: error.message 
    };
  }
};