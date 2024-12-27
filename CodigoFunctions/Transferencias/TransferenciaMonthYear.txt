exports = async function(mes, ano) {
  try {
    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    if (!mes  !ano  isNaN(mes)  isNaN(ano)) {
      return { error: "Os parâmetros 'mes' e 'ano' são obrigatórios e devem ser números válidos." };
    }

    if (mes < 1  mes > 12) {
      return { error: "O parâmetro 'mes' deve estar entre 1 e 12." };
    }

    const dataInicio = new Date(ano, mes - 1, 1); 
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999); 

    const pipeline = [
      {
        $project: {
          _id: 0,
          ID_Paciente: 1,
          Nome_Completo: 1,
          Relatorios_Clinicos: {
            $filter: {
              input: "$RegistroClinicos",
              as: "registro",
              cond: {
                $and: [
                  { $gte: ["$$registro.Data_Atendimento", dataInicio] },
                  { $lte: ["$$registro.Data_Atendimento", dataFim] }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          Relatorios_Clinicos: { $ne: [] } 
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results;

  }catch (error) {
        return {
            status: 500,
            message: "Erro ao pesquisar pelos os dados do genero:" + gen + ".",
            details: error.message
        };
    }
};