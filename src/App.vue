<template>
		<div class="minha-div" >
				<form @submit.prevent="query()">
					<h1>Visualizador de repositório Publicos </h1>
					<br/>
					<br/>
					<label>Digite o nome do autor do repositorio: </label>
					<br/>
					<input type="text" name="nameAuthor" v-model="git.nameAuthor" placeholder="CaioMichelSantos" v-validate data-vv-rules="required"> 
          <br/>
					<span class="error" v-show="errors.has('nameAuthor')">Campo Obrigatório</span>
					<br/>
					<br/>
					<label>Digite o nome do repositorio: </label>
					<br/>
					<input type="text" name="repository" v-model="git.repository"  placeholder="apiKeepi" v-validate data-vv-rules="required">
					<br/>
					<span class="error" v-show="errors.has('repository')">Campo Obrigatório</span>
					<br/>
					<br/>
					<label>Digite o nome da branch: </label>
					<br/>
					<input type="text" name="branch" v-model="git.branch" placeholder="master" v-validate data-vv-rules="required">
					<br/>
					<span class="error" v-show="errors.has('branch')">Campo Obrigatório</span>
					<br/>
					<br/>
				<button type="submit" class="btn btn-default">Buscar</button>
			</form>

			<br/>
			<br/>

			<table>
				<tr v-for="list of gitList">
					<td>{{list.name}}</td>
					<td><a :href="list.html_url" target="_black">Link para Arquivo</a></td>
				</tr>
			</table>
			<br/>
			<span class="error"  v-show="errorPromisse" >Falha ao contatar o servidor verifique a conexão com a internet e tente novamente</span>
			<span class="error"  v-show="errorGit" >Falha ao Buscar Diretorio, favor conferir o nome do autor, repositorio e branch</span>
		</div>
</template>


<script>
export default {
  data() {
    return {
      git: {
        nameAuthor: "",
        repository: "",
        branch: ""
      },
      gitList: [],
      errorPromisse: false,
      errorGit: false
    };
  },
  methods: {
    query() {
      this.$validator.validateAll().then(success => {
        if (success) {
          this.$http.post("http://localhost:3000/v1/git/", this.git).then(
            response => {
              if (response.body) {
                this.gitList = response.body;
                this.errorGit = false;
                this.errorPromisse = false;
              } else {
								this.errorGit = true;
              }
            },
            error => {
							this.errorPromisse = true;
							this.errorGit = false;
            }
          );
        }
      });
    }
  }
};
</script>

<style>
div.minha-div {
  width: 500px;
  height: 300px;
  outline: 1px;
  position: relative;
  left: 50%;
  margin-left: -250px;
}
span.error{
	color: #FF0000;
}

h1,h2 {
  font-weight: normal;
  text-align: center;
  color: #42b983;
}

label {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}
</style>
