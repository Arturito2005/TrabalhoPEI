module namespace page = 'http://www.medsync.com/RegistosClinicos/getResumoMensalRegistosClinicos';

declare namespace rm = "https://www.medsync.com/ResumoMensalRegistosClinicos";

declare 
  %rest:path("/RegistosClinicos/getResumoMensalRegistosClinicos") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getRelatorioRegistosClinicos($mes as xs:int, $ano as xs:int) {
 
  let $url := concat('https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getResumoMensalRegistosClinicos?',
      'mes=', $mes, '&amp;ano=', $ano)
    for $resumoMensal in http:send-request(
      <http:request method="get" />,
      $url
    )[2]/json
    
    return element resumo_mensal {
      namespace rm { "https://www.medsync.com/ResumoMensalRegistosClinicos" },
      element rm:tot_atendidos { $resumoMensal/Total__Atendimento/text() },
       
         for $genero in $resumoMensal/genero/_
         return element rm:genero {
           attribute id_genero { $genero/genero },
           element rm:tot_tratamentos { $genero/tot__tratamentos/text() },
       
           element rm:faixas_etarias {
             for $faixa in $genero/faixas__etarias/_
             return element rm:faixa_etaria {
               element rm:idades { $faixa/Faixa__Etaria/text() },
               element rm:tot_tratamentos { $faixa/Total__Tratamentos/text() },
               element rm:tot_cronicos { $faixa/Total__Cronicos/text() },
       
               element rm:especialidades {
                 for $especialidade in $faixa/Especialidades/_
                 return element rm:especialidade {
                   element rm:nome_especialidade { $especialidade/Especialidade/text() },
                   element rm:tot_tratamentos { $especialidade/Total__Tratamentos/text() },
                   element rm:tot_cronicos { $especialidade/Total__Cronicos/text() }
                 }
               }
             }
           }
         }
       }
      
};