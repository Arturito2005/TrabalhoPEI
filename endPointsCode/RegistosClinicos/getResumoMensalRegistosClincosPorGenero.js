exports = async function(request, response) {
  try {
    const gen = request.query.gen;
    const ano = parseInt(request.query.ano, 10);
    const mes = parseInt(request.query.mes, 10);
    const faixa = request.query.faixa;
    const ano_min = parseInt(request.query.ano_min, 10);
    const ano_max = parseInt(request.query.ano_max, 10);

    const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");

    const data_atend_min = new Date(ano, mes - 1, 1);
    const data_atend_max = new Date(ano, mes, 0, 23, 59, 59, 999);
    const data_nasc_min = new Date(ano_min, 0, 1);
    const data_nasc_max = new Date(ano_max, 11, 31, 23, 59, 59, 999);

    const faixa_etaria = await collection.aggregate([
      {
        $match: {
          Género: gen,
          RegistoClinicos: {
            $exists: true,
            $elemMatch: {
              Data_Atendimento: {
                $gte: data_atend_min,
                $lte: data_atend_max
              }
            }
          },
          Data_Nascimento: {
            $gte: data_nasc_min,
            $lte: data_nasc_max
          }
        }
      },
      {
        $unwind: {
          path: "$RegistoClinicos",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $set: {
          "RegistoClinicos.Tratamentos": {
            $ifNull: ["$RegistoClinicos.Tratamentos", []]
          }
        }
      },
      {
        $addFields: {
          Total_Tratamentos: { $size: "$RegistoClinicos.Tratamentos" },
          Total_Cronicos: {
            $size: {
              $filter: {
                input: "$RegistoClinicos.Tratamentos",
                as: "tratamento",
                cond: { $eq: ["$$tratamento.Realizado", "Sim"] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$RegistoClinicos.Especialidade",
          Género: { $first: "$Género" },
          Total_Atendimentos: { $sum: 1 },
          Total_Tratamentos: { $sum: "$Total_Tratamentos" },
          Total_Cronicos: { $sum: "$Total_Cronicos" }
        }
      },
      {
        $addFields: {
          Faixa_Etaria: faixa,
          Especialidade: "$_id"
        }
      },
      {
        $group: {
          _id: "$Faixa_Etaria",
          Faixa_Etaria: { $first: "$Faixa_Etaria" },
          Total_Atendimentos: { $sum: "$Total_Atendimentos" },
          Total_Tratamentos: { $sum: "$Total_Tratamentos" },
          Total_Cronicos: { $sum: "$Total_Cronicos" },
          Especialidades: {
            $push: {
              Especialidade: "$Especialidade",
              Total_Tratamentos: "$Total_Tratamentos",
              Total_Cronicos: "$Total_Cronicos"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          Faixa_Etaria: 1,
          Total_Atendimentos: 1,
          Total_Tratamentos: 1,
          Total_Cronicos: 1,
          Especialidades: 1
        }
      }
    ]).toArray();

    return faixa_etaria;
  } catch (error) {
    return {
      status: 500,
      message: "Erro ao processar os dados.",
      details: error.message
    };
  }
};
