module namespace page = 'http://www.medsync.com/RegistosClincios/getRegistosClinicos';

declare namespace rc = "https://www.medsync.com/listaRegistoClinico";
declare namespace d = "https://www.medsync.com/Diagnostico";
declare namespace tra = "https://www.medsync.com/Tratamento";

declare 
  %rest:path("/RegistosClincios/getRegistosClinicos") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getRegistosClinicos($mes as xs:int, $ano as xs:int) {
    element lista_registos {
      namespace rc {"https://www.medsync.com/listaRegistoClinico"},
      namespace d { "https://www.medsync.com/Diagnostico"},
      namespace tra { "https://www.medsync.com/Tratamento"},
          
    let $url := concat('https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getRegistosClinicos?',
'mes=', $mes, '&amp;ano=', $ano)
      for $registoClinico in http:send-request(
        <http:request method="get" />,
        $url
      )[2]/json/_
      
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
    }
};