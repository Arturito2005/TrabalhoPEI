module namespace page = 'http://www.medsync.com/Transferencias/getRelatorioTransferencia';

declare namespace hg = "https://www.medsync.com/infoGeralHospital";
declare namespace h = "https://www.medsync.com/infoHospitalDestino";
declare namespace rt = "https:/www.medsync.com/listaTransferencia";
declare namespace rm = "https://www.medsync.com/ResumoMensalTransferencias";
declare namespace tra = "https://www.medsync.com/Tratamento";
declare namespace d = "https://www.medsync.com/Diagnostico";

declare 
  %rest:path("/Transferencias/getRelatorioTransferencia") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getRelatorioTransferencia($mes as xs:int, $ano as xs:int) {
    let $url := concat(
      'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getRelatorioTransferencias?',
      'mes=', $mes, '&amp;ano=', $ano
    )
    for $relatorio in http:send-request(
      <http:request method="get" />,
      $url
    )[2]/json
  
    return element relatorio_transferencias {
       namespace xsi {"http://www.w3.org/2001/XMLSchema-instance"},
       attribute xsi:schemaLocation {"https://www.medsync.com/Transferencias/getRelatorioTransferencia main.xsd"},
       namespace hg {"https://www.medsync.com/infoGeralHospital"},
       namespace h {"https://www.medsync.com/infoHospitalDestino"},
       namespace rt {"https:/www.medsync.com/listaTransferencia"},
       namespace rm {"https://www.medsync.com/ResumoMensalTransferencias"},
       namespace tra {"https://www.medsync.com/Tratamento"},
       namespace d {"https://www.medsync.com/Diagnostico"},
       
        element hospitais {
          for $hospital in $relatorio/hospitais/_        
          return element hospital {
            attribute hg:id { $hospital/hospitalId},
            element hg:nome { $hospital/__id/text()}
          }        
        },

        element lista_transferencias {
          for $transferencia in $relatorio/registos__transferencias/_
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
        }, 
      
      element resumo_mensal {
        element rm:tot_transferencias { $relatorio/resumo__mensal/totalTransferencias/_/total/text()},
        
        if( $relatorio/resumo__mensal/porMotivo) then
          element rm:motivos {
            for $motivos in $relatorio/resumo__mensal/porMotivo/_
            
            return element rm:motivo {
              element rm:nome { $motivos/__id/text()},
              element rm:tot_transferencias { $motivos/total/text()}                  
            }
          },
        
        if( $relatorio/resumo__mensal/porTipo) then
          element rm:tipos {
            for $tipos in $relatorio/resumo__mensal/porTipo/_
            return element rm:tipo {
              element rm:nome { $tipos/__id/text()},
              element rm:tot_transferencias { $tipos/total/text()}
            }
            
          },
          
        if( $relatorio/resumo__mensal/porHospital) then 
           element rm:hospitais {
              for $hospital in $relatorio/resumo__mensal/porHospital/_
              return element rm:hospital {
                element hg:nome { $hospital/__id/text()},
                element rm:tot_transferencias { $hospital/total/text()}
              }
           } 
      }    
    }
  };