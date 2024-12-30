exports = async function(request, response){
  try {
    const ano = parseInt(request.query.ano, 10);
    const mes = parseInt(request.query.mes, 10);
    if(mes < 0 || mes > 12) {
      return { 
        status: 400, 
        message: "O campo mes deve ser um numero entre 0 e 12", 
      };
    }

    const data_atual = new Date();
    const ano_atual = data_atual.getFullYear();
      
    if(ano < 1500 || ano > ano_atual) {
      return { 
        status: 400, 
        message: "O parametro ano deve ser inferior a 1500 e superior ao ano atual (" + ano_atual + ")", 
      };
    } 
    
    const hospital = {
      id_hospital : 1,
      nome: "Hospital Geral",
      morada: "Rua Saúde, 123",
      mes: mes,
      ano_fiscal: ano
    } 
    
    const RelatorioRegistosClinicos = {
        hospital: hospital,
        lista_pacientes: await context.functions.execute("getPacientes"),
        lista_registos: await context.functions.execute("getRegistosClinicos"),
        resumo_mensal: await context.functions.execute("getResumoMensalRegistosClinicos", {
                                                      query: {
                                                        mes: mes,
                                                        ano: ano
                                                      }})    
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