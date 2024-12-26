exports = async function(arg){
  const collection = context.services.get("mongodb-atlas").db("MedSync").collection("AmostraRegistosClinicos");
    
  const registosClinicos = await collection.find({}, {_id: 0,
                                                 ID_Atendimento: 1, 
                                                 Data_Atendimento: 1, 
                                                 ID_Profissional: 1, 
                                                 Especialidade: 1, 
                                                 Diagnosticos: 1, 
                                                 Tratamentos: 1}).toArray();
  return registosClinicos;
};