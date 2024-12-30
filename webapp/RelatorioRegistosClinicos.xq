module namespace page = 'http://www.medsync.com/RegistosClinicos/getRelatorioRegistosClinicos';

declare namespace xsi ="http://www.w3.org/2001/XMLSchema-instance";
declare namespace hg = "https://www.medsync.com/infoGeralHospital";
declare namespace h = "https://www.medsync.com/infoHospital";
declare namespace p = "https://www.medsync.com/listaPacientes";
declare namespace rc = "https://www.medsync.com/listaRegistoClinico";
declare namespace rm = "https://www.medsync.com/ResumoMensalRegistosClinicos";
declare namespace d = "https://www.medsync.com/Diagnostico";
declare namespace tra = "https://www.medsync.com/Tratamento";

declare 
  %rest:path("/RegistosClinicos/getRelatorioRegistosClinicos") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getRelatorioRegistosClinicos($mes as xs:int, $ano as xs:int) {
    
    let $url := concat(
      'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getRelatorioRegistosClinicos?',
      'mes=', $mes, '&amp;ano=', $ano
    )
    for $relatorio in http:send-request(
      <http:request method="get" />,
      $url
    )[2]/json
        
     return element relatorio_clinico {
       (:Falta apenas isto xmlns="https://www.medsync.com/RegistosClinicos":)
       namespace xsi {"http://www.w3.org/2001/XMLSchema-instance"},
       attribute xsi:schemaLocation {"https://www.medsync.com/RegistosClinicos/getRelatorioRegistosClinicos main.xsd"},
       namespace hg {"https://www.medsync.com/infoGeralHospital"},
       namespace h {"https://www.medsync.com/infoHospital"},
       namespace p {"https://www.medsync.com/listaPacientes"},
       namespace rc {"https://www.medsync.com/listaRegistoClinico"},
       namespace rm {"https://www.medsync.com/ResumoMensalRegistosClinicos"},
       namespace d {"https://www.medsync.com/Diagnostico"},
       namespace tra {"https://www.medsync.com/Tratamento"},
       element hospital {
         attribute hg:id { $relatorio/hospital/id__hospital },
         element hg:nome { $relatorio/hospital/nome/text() },
         element hg:morada { $relatorio/hospital/morada/text() },
         element h:mes { $relatorio/hospital/mes/text() },
         element h:ano_fiscal { $relatorio/hospital/ano__fiscal/text() }
       },
       
       element lista_pacientes {
         for $paciente in $relatorio/lista__pacientes/_
         return element paciente {
           attribute id { $paciente/ID__Paciente },
           element p:nome { $paciente/Nome__Completo/text() },
           element p:data_nascimento { $paciente/Data__Nascimento/text() },
           element p:genero { $paciente/Género/text() },
           element p:contacto {
             element p:telefone { $paciente/Telefone/text() },
             element p:email { $paciente/Email/text() }
           },
           element p:tipo_paciente { $paciente/Tipo__Paciente/text() }
         }
       },

       element lista_registos {
         for $registoClinico in $relatorio/lista__registos/_
         return element registo_clinico {
           attribute codigo_atend { $registoClinico/ID__Atendimento },
           element rc:data { $registoClinico/Data__Atendimento/text() },
           element rc:id_medico { $registoClinico/ID__Profissional/text() },
           element rc:especialidade_med { $registoClinico/Especialidade/text() },
           if ($registoClinico/Diagnosticos) then
             element d:diagnosticos {
               for $diagnostico in $registoClinico/Diagnosticos/_
               return element d:diagnostico {
                 attribute Codigo_CID10 { $diagnostico/Codigo__CID10 },
                 element d:tipo_diagnostico { $diagnostico/Tipo__Diagnostico/text() },
                 element d:descricao { $diagnostico/Descricao__Diagnostico/text() }
               }
             },
           if ($registoClinico/Tratamentos) then
             element tra:tratamentos {
               for $tratamento in $registoClinico/Tratamentos/_
               return element tra:tratamento {
                 attribute cod_tratamento { $tratamento/ID__Tratamento },
                 element tra:tipo { $tratamento/Tipo__Tratamento/text() }
               }
             }
         }
       },

       element resumo_mensal {
         element rm:tot_atendidos { $relatorio/resumo__mensal/Total__Atendimento/text() },
       
         for $genero in $relatorio/resumo__mensal/genero/_
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

     }
  };
