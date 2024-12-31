exports = async function(request, response){
  try {
    const ano = parseInt(request.query.ano, 10);
    const mes = parseInt(request.query.mes, 10);
    
    if (mes < 1 || mes > 12) {
      return { 
        status: 400, 
        message: "O campo mes deve ser um numero entre 0 e 12", 
      };
    }

    const data_atual = new Date();
    const ano_atual = data_atual.getFullYear();
    
    if (ano < 1500 || ano > ano_atual) {
      return { 
        status: 400, 
        message: "O parametro ano deve ser inferior a 1500 e superior ao ano atual (" + ano_atual + ")", 
      };
    } 
    
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const data_registo_min = new Date(ano, mes - 1, 1);
    const data_registo_max = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    const pacientes = await collection.find({Data_Registo: {
                                              $gte: data_registo_min,
                                              $lte: data_registo_max 
                                              }}).toArray();

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