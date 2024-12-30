module namespace page = 'http://www.medsync.com/Transferencias/getResumoMensalTransferencia';

declare namespace rm = "https://www.medsync.com/ResumoMensal";

declare 
  %rest:path("/Transferencias/getResumoMensalTransferencia") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getResumoMensalTransferencia($mes as xs:int, $ano as xs:int) {
    let $url := concat(
      'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getResumoMensalTransferencia?',
      'mes=', $mes, '&amp;ano=', $ano
    )
    
    for $resumoMensal in http:send-request(
      <http:request method="get" />,
      $url
    )[2]/json
    
     return element resumo_mensal {
        namespace rm { "https://www.medsync.com/ResumoMensal" },
        element rm:tot_transferencia { $resumoMensal/totalTransferencias/_/total/text()},
        
        if( $resumoMensal/porMotivo) then
          element rm:motivos {
            for $motivos in $resumoMensal/porMotivo/_
            
            return element rm:motivo {
              element rm:nome { $motivos/__id/text()},
              element rm:tot_transferencias { $motivos/total/text()}                  
            }
          },
        
        if( $resumoMensal/porTipo) then
          element rm:tipos {
            for $tipos in $resumoMensal/porTipo/_
            return element rm:tipo {
              element rm:nome { $tipos/__id/text()},
              element rm:tot_transferencias { $tipos/total/text()}
            }
            
          },
          
        if( $resumoMensal/porHospital) then 
           element rm:hospitais {
              for $hospital in $resumoMensal/porHospital/_
              
              return element hospital {
                element rm:nome { $hospital/__id/text()},
                element rm:tot_transferencias { $hospital/total/text()}
              }
           } 
      }    
    
};