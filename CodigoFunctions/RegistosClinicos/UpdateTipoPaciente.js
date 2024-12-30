exports = async function({query, headers, body }, response){
    const collection = context.services
            .get("mongodb-atlas")
            .db("MedSync")
            .collection("Pacientes");
  
    const pacientes = collection.find().toArray();

    for (let i = 0; i < pacientes.length; i++) {
      const paciente = pacientes[i];
      let tipo_paciente;

      if(Array.isArray(paciente.RegistoClinicos) && paciente.RegistoClinicos.length >= 1) {
        let cronico = false;
        
        for (let j = 0; j < paciente.RegistoClinicos.length && !cronico; j++) {
          const registo = paciente.RegistoClinicos[j];
          
          if(Array.isArray(registo.Tratamentos)) {
            for (let k = 0; k < registo.Tratamentos.length && !cronico; k++) {
          
              if (registo.Tratamentos[k].Realizado == "Não") {
                cronico = true;
              }
            }
          }  
          
        }
        
        if(!cronico) {
          tipo_paciente = "Regular";
        } else {
          tipo_paciente = "Crónico";
        }    
      } else {
        tipo_paciente = "Novo"
      }

      if(paciente.Tipo_Paciente != tipo_paciente) {
        const result = await collection.updateOne(
          { ID_Paciente: paciente.ID_Paciente },
          { $set: { Tipo_Paciente: tipo_paciente } }
        );
      }
    }
  
    return pacientes;
};