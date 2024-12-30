module namespace page = 'http://www.medsync.com/Transferencias/getTransferencias';

declare namespace rt = "https:/www.medsync.com/listaTransferencia";
declare namespace tra = "https://www.medsync.com/Tratamento";
declare namespace d = "https://www.medsync.com/Diagnostico";

declare 
  %rest:path("/Transferencias/getTransferencias") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getTransferencias($mes as xs:int, $ano as xs:int) {
    element transferencias {
      namespace rt {"https:/www.medsync.com/listaTransferencia"},
      namespace tra {"https://www.medsync.com/Tratamento"},
      namespace d {"https://www.medsync.com/Diagnostico"},
      let $url := concat(
        'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getTransferencias?',
        'mes=', $mes, '&amp;ano=', $ano
      )
      
      for $transferencias in http:send-request(
        <http:request method="get" />,
        $url
      )[2]/json
    

      for $transferencia in $transferencias/_
      return element transferencia {
        attribute id {$transferencia/ID__Transferencia},
        element rt:cod_paciente { $transferencia/ID__Paciente/text()},
        element rt:data_transferencia { $transferencia/Data__Transferencia/text() },
        element rt:motivo { $transferencia/Motivo/text()},
        element rt:tipo_transferencia { $transferencia/Tipo__Transferencia/text()},
        
        if( $transferencia/RegistoClinicos) then 
            element rt:relatorios_medicos {
              for $relatorio_med in $transferencia/RegistoClinicos/_ 
              return element rt:relatorio_medico {
                  attribute id { $relatorio_med/ID__Atendimento},
                  element rt:id_profissional { $relatorio_med/ID__Profissional/text()},
                  element rt:especialidade { $relatorio_med/Especialidade/text()},
                  element rt:data_atendimento { $relatorio_med/Data__Atendimento/text()},
                  if( $relatorio_med/Diagnosticos ) then
                    element d:diagnosticos {
                      for $diagnosticos in $relatorio_med/Diagnosticos/_
                      return element d:diagnostico {
                         attribute Codigo_CID10 { $diagnosticos/Codigo__CID10},
                         element d:tipo_diagnostico { $diagnosticos/Tipo__Diagnostico/text()},
                         element d:descricao { $diagnosticos/Descricao__Diagnostico/text()}
                      }
                    },
                    
                  if( $relatorio_med/Tratamentos) then 
                    element tra:tratamentos {
                      for $tratamento in $relatorio_med/Tratamentos/_
                      return element tra:tratamento {
                        attribute id { $tratamento/ID__Tratamento},
                        element tra:tipo_tratamento { $tratamento/Tipo__Tratamento/text()}
                      }
                    }
              }
            }  
        }
    }
  };