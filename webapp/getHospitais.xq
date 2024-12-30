module namespace page = 'http://www.medsync.com/Transferencias/getHospitaisTransferencias';

declare namespace hg = "https://www.medsync.com/infoGeralHospital";

declare 
  %rest:path("/Transferencias/getHospitaisTransferencias") 
  %rest:GET
  %rest:query-param("mes", "{$mes}")
  %rest:query-param("ano", "{$ano}")
  function page:getHospitaisTransferencias($mes as xs:int, $ano as xs:int) {    
  
  element hospitais {
    namespace hg { "https://www.medsync.com/infoGeralHospital" },
    let $url := concat(
        'https://eu-west-2.aws.data.mongodb-api.com/app/medsync_api-jqjjbuy/endpoint/getHospitaisTransferencias?',
        'mes=', $mes, '&amp;ano=', $ano
    )
    
    for $hospitais in http:send-request(
      <http:request method="get" />,
      $url
    )[2]/json
    
    for $hospital in $hospitais/_        
    return element hospital {
      attribute hg:id { $hospital/hospitalId},
      element hg:nome { $hospital/__id/text()}
    }        
  }
};