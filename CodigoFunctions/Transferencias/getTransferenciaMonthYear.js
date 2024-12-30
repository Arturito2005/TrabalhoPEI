exports = async function(request, response) {
  try {
    const mes = parseInt(request.query.mes, 10);
    const ano = parseInt(request.query.ano, 10);

    if (isNaN(mes) || isNaN(ano)) {
      return { error: "Os parâmetros 'mes' e 'ano' são obrigatórios e devem ser números válidos." };
    }

    if (mes < 1 || mes > 12) {
      return { error: "O parâmetro 'mes' deve estar entre 1 e 12." };
    }

    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Transferencias");

    const dataInicio = new Date(ano, mes - 1, 1); 
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999); 

    const pipeline = [
      {
        $match: {
          Data_Transferencia: { 
            $gte: dataInicio, 
            $lte: dataFim 
          }
        }
      },
      {
        $facet: {
          totalTransferencias: [
            { $count: "total" }
          ],
          porMotivo: [
            { $group: { _id: "$Motivo", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
          ],
          porTipo: [
            { $group: { _id: "$Tipo_Transferencia", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
          ],
          porHospital: [
            { $group: { _id: "$Hospital_Destino", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
          ]
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return {
      status: 200,
      resumo: results[0]
    };

  } catch (error) {
    return {
      status: 500,
      message: `Erro ao pesquisar as transferências no mês ${request.query.mes} e no ano ${request.query.ano}.`,
      details: error.message
    };
  }
};
