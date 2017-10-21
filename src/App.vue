<template>
		<div class="minha-div" >
				<form @submit.prevent="query()">
					<h1>Visualizar de repositorio Publicos </h1>
					<br/>
					<br/>
					<label>Digite o nome do autor do repositorio: </label>
					<br/>
					<input type="text" v-model="git.nameAuthor"  placeholder="CaioMichelSantos">
					<br/>
					<br/>
					<label>Digite o nome do repositorio: </label>
					<br/>
					<input type="text" v-model="git.repository"  placeholder="apiKeepi">
					<br/>
					<br/>
					<label>Digite o nome da branch: </label>
					<br/>
					<input type="text" v-model="git.branch" placeholder="master">
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
			<div class="p-3 mb-2 bg-danger text-white" v-show="errorPromisse" >Falha ao contatar o servidor </div>
			<br/>
			<div class="p-3 mb-2 bg-danger text-white" v-show="errorGit" >Falha ao Buscar Diretorio, favor conferir o nome do autor, repositorio e branch</div>
		</div>
</template>


<script>
export default {
  data () {
    return {
      git: {
				nameAuthor: "",
				repository: "",
				branch: "",

			},
			gitList: [],
			errorPromisse: false,
			errorGit: false,
    }
	},
	methods: {
    query() {
			var that = this;
			this.$http.post('http://localhost:3000/v1/git/',this.git).then(
            response=>{
							if(response.body){
								that.gitList = response.body
								that.errorGit = false;
								that.errorPromisse = false;
							}else{
								that.errorGit = true;
							}
									
            },
            error=>{
							that.errorPromisse = true;
							gitList: [];
            })
		}	
  }
}

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

h1, h2 {
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
