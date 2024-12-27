exports = async function({ano, mes, idade_min, idade_max, ano_min, ano_max, gen}) {
  try {        
      const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");
    
      const faixa_etaria = collection.aggregate([
          {
            $match: {
              Género: gen,
              RegistoClinicos: {
                $exists: true
              },
              RegistoClinicos: {
                $elemMatch: {
                  Data_Atendimento: {
                    $gte: new Date(ano + "-" + mes + "-01"),
                    $lte: new Date(ano + "-" + mes + "-31")
                  }
                }
              },
              Data_Nascimento: {
                $gte: new Date(ano_min + "-" + "01-01"),
                $lte: new Date(ano_max + "-" + "12-01")
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
            $group: {
              _id: "$RegistoClinicos.Especialidade",
              Género: {
                $first: "$Género"
              },
              total_Atendimentos: {
                $sum: 1
              },
              tratamentosCronicos: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$RegistoClinicos.Tratamentos.Realizado",
                        "Não"
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          },
          {
            $addFields: {
              Faixa_Etaria: idade_min + "-" + idade_max,
              Especialidade: "$_id"
            }
          },
          {
            $group: {
              _id: "$Faixa_Etaria",
              Faixa_Etaria: {
                $first: "$Faixa_Etaria"
              },
              tot_atendimentos: {
                $sum: "$total_Atendimentos"
              },
              Especialidades: {
                $push: {
                  Especialidade: "$Especialidade",
                  Total_Atendimentos:
                    "$total_Atendimentos",
                  Total_Cronicos: "$tratamentosCronicos"
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              Faixa_Etaria: 1,
              tot_atendimentos: 1,
              Especialidades: 1
            }
          }
        ]);

      return faixa_etaria.toArray();
  } catch (error) {
      return {
          status: 500,
          message: "Erro ao pesquisar pelos os dados do genero:" + gen + ".",
          details: error.message
      };
  }
};