module namespace page = 'http://www.medsync.com/RegistosClincios/pacientes';

declare namespace p = "https://www.medsync.com/listaPacientes";

declare 
  %rest:path("/RegistosClincios/getPacientes") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getPacientes($mes as xs:int, $ano as xs:int) {
    element pacientes {
       namespace p { "https://www.medsync.com/listaPacientes" },
      let $url := concat(
      'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getPacientes?',
      'mes=', $mes, '&amp;ano=', $ano
    )
      for $paciente in http:send-request(
        <http:request method="get" />,
        $url
      )[2]/json/_
       
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
  }
};