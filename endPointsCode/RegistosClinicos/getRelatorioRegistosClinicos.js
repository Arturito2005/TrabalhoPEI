/*Falta testar*/

exports = async function({mes, ano}, arg){
  /*
  Dá erro no codigo do Resumo Mensal
  Depois ver se a estrutura retornada por ele é a correta
  */
  try {
    const hospital = {
      id_hospital : 1,
      nome: "Hospital Geral",
      morada: "Rua Saúde, 123"
    } 
    
    const RelatorioRegistosClinicos = {
        hospital: hospital, 
        pacientes: await context.functions.execute("getPacientes", arg),
        registos_clinicos: await context.functions.execute("getRegistosClinicos", arg),
        resumoMensal: await context.functions.execute("getResumoMensalRegistosClinicos", {mes, ano}, arg)    
    }

    return RelatorioRegistosClinicos;
  } catch (error) {
    return { 
      status: 500, 
      error: "Erro na criação do relatorio dos Registos Clinicos.", 
      details: error.message 
    };
  }
};