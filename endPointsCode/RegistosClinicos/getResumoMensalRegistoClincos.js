exports = async function({mes, ano}){
    try {
      /*Depois otimizar o tempo da pesquisa*/
      
        const Genero_F = {
            genero: "F",
            cont: 0,
            faixa_etaria: []
        }

        const Genero_M = {
            genero: "M",
            cont: 0,
            faixa_etaria: []
        }
  
        const data_atual = new Date();
        const ano_atual = data_atual.getFullYear();
        
        for (let i = 0; i < 12; i++) {
            const min_idade = 10 * i;
            const max_idade = 10 * (i + 1);

            const ano_min = ano_atual - min_idade;
            const ano_max = ano_atual - max_idade;
            
            //Masculino
            const faixa_etaria_M = await context.functions.execute("getResumoMensalRegistosClincosPorGenero", {
                                                                 ano: ano, 
                                                                 mes: mes, 
                                                                 idade_min: min_idade, 
                                                                 idade_max: max_idade, 
                                                                 ano_min: ano_min, 
                                                                 ano_max: ano_max, 
                                                                 gen: "M"});

            Genero_M.faixa_etaria[Genero_M.cont++] = faixa_etaria_M;

            //Feminino
            const faixa_etaria_F = await context.functions.execute("getResumoMensalRegistosClincosPorGenero", {
                                                                 ano:ano, 
                                                                 mes: mes, 
                                                                 idade_min: min_idade, 
                                                                 idade_max: max_idade, 
                                                                 ano_min: ano_min, 
                                                                 ano_max: ano_max, 
                                                                 gen: "F"});
            Genero_F.faixa_etaria[Genero_F.cont++] = faixa_etaria_F;
        }
    
        const ResumoMensal ={
            genero: new Array(2)
        }
    
        ResumoMensal.genero[0] = Genero_M;
        ResumoMensal.genero[1] = Genero_F;
        return ResumoMensal;
    } catch (error) {
      return { 
          status: 500, 
          error: "Erro a consultar resumo mensal dos registos Clinicos.", 
          details: error.message 
      };
    }
  };