exports = async function(arg){
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");
  
    const pacientes = collection.find().toArray();
  
    for(let i = 0; i < pacientes.length ; i++) {
      const paciente = pacientes[i];
      let telefone = "";
    
      if(!paciente.Telefone || paciente.Telefone === null || paciente.Telefone === "") {
          telefone = "não fornecido";
      } else {
          telefone = paciente.Telefone;
      }

      let email = paciente.Email;
      if(email === "desconhecido") {
          email = "não fornecido";
      }

      if(email === "não fornecido" || telefone === "não fornecido") {
        const result = await collection.updateOne(
          { ID_Paciente: paciente.ID_Paciente },
          { $set: { Telefone: telefone, Email: email } }
        );
      }
    }

    return pacientes;
};