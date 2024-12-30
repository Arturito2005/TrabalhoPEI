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
    
      const Genero_F = {
          genero: "F",
          tot_atendimento: 0,
          tot_tratamentos: 0,
          faixas_etarias: []
      }

      const Genero_M = {
          genero: "M",
          tot_atendimento: 0,
          tot_tratamentos: 0,
          faixas_etarias: []
      }
    
      for (let i = 0; i < 12; i++) {
          const idade_min = 10 * i;
          const idade_max = 10 * (i + 1);
          const ano_min = ano_atual - idade_max;
          const ano_max = ano_atual - idade_min;

          const faixa = idade_min + "-" + idade_max;
          const faixa_etaria_M = await context.functions.execute("getResumoMensalRegistosClinicosPorGenero", {
                                                                       query: {
                                                                        gen: "M",
                                                                        ano: ano, 
                                                                        mes: mes, 
                                                                        faixa: faixa, 
                                                                        ano_min: ano_min, 
                                                                        ano_max: ano_max
                                                                      }});

          if (faixa_etaria_M && faixa_etaria_M.length > 0) {
            Genero_M.faixas_etarias.push(...faixa_etaria_M);
          }

          const faixa_etaria_F = await context.functions.execute("getResumoMensalRegistosClinicosPorGenero", {
                                                                       query: {
                                                                        gen: "F",
                                                                        ano: ano, 
                                                                        mes: mes, 
                                                                        faixa: faixa, 
                                                                        ano_min: ano_min, 
                                                                        ano_max: ano_max
                                                                      }});
          if (faixa_etaria_F && faixa_etaria_F.length > 0) {
            Genero_F.faixas_etarias.push(...faixa_etaria_F);
          }
      }

      Genero_M.faixas_etarias.forEach(faixaItem => {
              Genero_M.tot_tratamentos += faixaItem.Total_Tratamentos;
              Genero_M.tot_atendimento += faixaItem.Total_Atendimentos;
      });
  
      Genero_F.faixas_etarias.forEach(faixaItem => {
              Genero_F.tot_tratamentos += faixaItem.Total_Tratamentos;
              Genero_F.tot_atendimento += faixaItem.Total_Atendimentos;
      });
      const ResumoMensal ={
          Total_Atendimento: 0,
          genero: [Genero_M, Genero_F]
      }

      ResumoMensal.Total_Atendimento = Genero_M.tot_atendimento + Genero_F.tot_atendimento;
  
      return ResumoMensal;
  } catch (error) {
    return { 
        status: 500, 
        error: "Erro a consultar resumo mensal dos registos Clinicos.", 
        details: error.message 
    };
  }
};