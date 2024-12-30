exports = async function(){
  try {
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const pacientes = await collection.find().toArray();

    const updatesCronico = [];
    const updatesRegular = [];
    const updatesNovo = [];
    for (let i = 0; i < pacientes.length; i++) {
      const paciente = pacientes[i];
      let tipo_paciente;

      if(Array.isArray(paciente.RegistoClinicos) && paciente.RegistoClinicos.length >= 1) {
        let cronico = false;
        
        for (let j = 0; j < paciente.RegistoClinicos.length && !cronico; j++) {
          const registo = paciente.RegistoClinicos[j];
          
          if(Array.isArray(registo.Tratamentos)) {
            for (let k = 0; k < registo.Tratamentos.length && !cronico; k++) {
          
              if (registo.Tratamentos[k].Realizado == "Nao") {
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
        tipo_paciente = "Novo";
        
      }

        if(paciente.Tipo_Paciente != tipo_paciente) {
            switch(tipo_paciente) {
              case "Regular": {
                 updatesRegular.push(paciente.ID_Paciente);
                break;
              } case "Crónico": {
                updatesCronico.push(paciente.ID_Paciente);
                break;
              } case "Novo": {
                updatesNovo.push(paciente.ID_Paciente);
                break;
              } default: {
                break;
              }
            }  
        }
      
    }

    if (updatesCronico.length > 0) {
      await collection.updateMany(
        { ID_Paciente: { $in: updatesCronico } },
        { $set: { Tipo_Paciente: "Crónico" } }
      );
    }

    if (updatesRegular.length > 0) {
      await collection.updateMany(
        { ID_Paciente: { $in: updatesRegular } },
        { $set: { Tipo_Paciente: "Regular" } }
      );
    }

    if (updatesNovo.length > 0) {
      await collection.updateMany(
        { ID_Paciente: { $in: updatesNovo } },
        { $set: { Tipo_Paciente: "Novo" } }
      );
    }
    
    return {
      status: 200,
      message: "Atualização concluída.",
      detalhes: {
        cronicosAtualizados: updatesCronico.length,
        regularesAtualizados: updatesRegular.length,
        novosAtualizados: updatesNovo.length,
      }
    };
  } catch (error) {
    return { 
        status: 500, 
        error: "Erro ao tentar atualizar o tipo de Paciente dos Pacientes.", 
        details: error.message 
    };
  }
};