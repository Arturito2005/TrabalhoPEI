exports = async function(arg){
  /*Falta apenas fazer o codigo do resumo Mensal e talvez tenha de criar algo para o hospital
  Para o hospital para este caso uma const que eu crie aqui com dados genericos até era o melhor
  O ano e mes receber como parametro deste metodo, até era o ideal aqui e no getResumoMensal
  */
  const hospital = {
    id_hospital : 1,
    nome: "Hospital Geral",
    morada: "Rua Saúde, 123"
  } 
  
  const RelatorioRegistosClinicos = {
      pacientes: await context.functions.execute("getPacientes", arg),
      registos_clinicos: await context.functions.execute("getRegistosClinicos", arg),
      resumoMensal: await context.functions.execute("getResumoMensalRegistosClincos", arg)    
  }

  return RelatorioRegistosClinicos
};