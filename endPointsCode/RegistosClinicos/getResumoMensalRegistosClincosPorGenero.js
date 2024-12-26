/*Meter para receber o mes e talvez o ano, por parametro
Neste caso meter para receber por parametro também o genero
*/
exports = async function({ano, mes, gen}) {
    try {
        const collection = context.services.get("mongodb-atlas").db("MedSync").collection("Pacientes");
    
        const min_day = new Date(ano + "-" + mes + "-01");
        const max_day = new Date(ano + "-" + mes + "-31");

    
        /*DEPOIS APAGAR ESTAS DUAS MIN E MAX DAYS
        APAGAR TAMBÉM O GEN QUE METI IGAUL A M
        */
        gen = "M";  
        const min_day_test = new Date("2024-10-01");
        const max_day_test = new Date("2024-10-31");
        const pacientes = await collection.find({Género: gen,
                                                RegistoClinicos: {$exists: true},
                                                "RegistoClinicos": {
                                                    $elemMatch: {	
                                                        "Data_Atendimento": {
                                                            $gte: min_day_test,
                                                            $lte: max_day_test
                                                        }
                                                    }
                                                }
                                                }).sort({Data_Nascimento: 1});

        if (!pacientes) {
            return {
                status: 400,
                message:"Não foi encontrado nenhum paciente do gênero: " + gen + ".",
            };      
        }

        let especialidade = {
            nome_especialidade : "",
            tot_tratamentos: 0,
            tot_cronicos: 0
        }

        let faixas_etarias = {
            idade: "0-0",
            tot_atendimentos: 0,
            cont: 0,
            especialidades: []
        }

        let genero = {
            id_genero: gen,
            tot_atendimentos: 0,
            cont: 0,
            faixa_etaria: []
        }

        //Meter try catch, para quando não é carregado nenhum paciente
        //Variaveis de apoio
        const ano_atual = new Date().getFullYear(); //Indica o ano atual
        let idade_ini = ano_atual - new Date(pacientes[0].Data_Nascimento).getFullYear(); //Indica a idade atual do paciente 
        let faixa_idade = idade_ini + "-"; //Texto a ser guardado no campo da faixa etaria
        let dif_idades = false; //Avisa quando as idades forem diferentes, para depois guardar a idade que falta na faixa_idade

        //Ciclo para o sexo masculino  
        //Percorrer todos os pacientes 
        for(let i = 0; i < pacientes.lenght; i++)  {
            const paciente = pacientes[i];
            let idade_pa = ano_atual - new Date(paciente.Data_Nascimento).getFullYear();

            //Ver se assim funciona
            if(idade_ini != idade_pa) {
                dif_idades = true;
                faixa_idade = faixa_idade + idade_pa;
            }

            genero.tot_atendimentos += paciente.RegistoClinicos.lenght; //Atualiar o total de atendimentos do genero Masculino

            //Percorrer todos os registos clinciso do paciente
            for(let y = 0; y < paciente.RegistoClinicos.lenght; y++) {
                //Só falta esta parte das especialidades para testar
                const registoCli = paciente.RegistoClinicos[y]; 
                const nome_especialidade = registoCli.Especialidade;

                especialidade.nome_especialidade = nome_especialidade;
                const tratamento = registoCli.Tratamentos;
                //Percorrer todos os tratamentos do registo clinico
                for(let k = 0; k < tratamento.lenght; k++) {
                    dados_tratamento = tratamento[k];

                    if (dados_tratamento.Realizado === "Não") {
                        especialidade.tot_cronicos++;
                    }
                    especialidade.tot_tratamentos++;
                }

                //Guardar/Ataulizar os dados da especialidade na variavel faixas_etarias
                let especialidade_faixa = faixas_etarias.especialidades;
                let num_especialidade = 0;
                let find_especialidade = false;
                
                while(num_especialidade < especialidade_faixa.length && !find_especialidade) {
                    if(especialidade_faixa[num_especialidade] === nome_especialidade) {
                        find_especialidade = true;
                    } else {
                        num_especialidade++;
                    }
                }

                faixas_etarias.especialidades[num_especialidade] = especialidade;
            }


            if(dif_idades == true) {
                //guardar

                //Penso que com o .faixa_etaria esteja correto, se não remover.
                faixa = genero.faixas_etarias[cont].faixa_etaria;
                faixa.idade = faixa_idade;

                //Atualização do total de atendimentos da faixa etaria + as especialidades da mesma
                for(let z = 0; z < especialidade_faixa.length; z++) {
                    faixa.tot_atendimentos += especialidade_faixa[z].tot_atendimentos;
                    const find = false;
                    let pos_esp = 0;
                    while(pos_esp < faixa.especialidades.length && !find) {
                        if (faixa.especialidade[pos_esp] === especialidade_faixa[z].especialidade) {
                            find = true;
                        } else {
                            pos_esp++;
                        }
                    }

                    if(!find) {
                        faixa.especialidade[pos_esp].nome_especialidade = especialidade_faixa[z].nome_especialidade;
                    }

                    faixa.especialidade[pos_esp].tot_tratamentos += especialidade_faixa[z].especialidade.tot_tratamentos;
                    faixa.especialidade[pos_esp].tot_cronicos += especialidade_faixa[z].especialidade.tot_cronicos;
                }

                genero.cont++;
                //Reiniciar (O reiniciar da faixa_idade está mal, se calhar)
                faixa_ini = idade_pa;
                faixa_idade = idade_pa + "-";
                dif_idades = false;
                especialidade_faixa = [];
            }
        }
        //Apagar aqui não vai existir mais
        /*
        const resumoMensal = {
            total_atendidos: genero.tot_atendimentos,
            genero: new Array(2)
        };
        */ 

        return genero;
    } catch (error) {
        return {
            status: 500,
            message: "Erro ao pesquisar pelos os dados do genero:" + gen + ".",
            details: error.message
        };
    }
};