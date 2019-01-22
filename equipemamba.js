<AppBarModifier bgColor="#138C9F" textColor="#ffffff" title="SICLOS" />
<div class="message">
  {#if loadgin}
  <div style="padding: 8px;"><img alt="gif loading" src="assets/loadgin2.gif" style="width: 240px;"></div>
  <br>
  <br>
  {/if}
  {#if !loadgin}
  {#if reloadingRequestBollean}
  <h5 class="message">Falha de conexão :( Por favor tente reconectar. Caso problema persista entre em contato com o suporte via
     https://app.siclospag.com.br
  </h5>
  <Button bgColor="#138C9F" on:click="reloadingRequest()" width="60%">Reconectar</Button>
  {/if}
  {#if !reloadingRequestBollean}
  {#if !viewQuestion1}
  <div><img style="width: 200px; margin-left: 22px" src="assets/SICLOSPGTOSCOMERCIAL.png" alt="Imagem do logo"></div>
  {#if loadingCarrinho}
  <div><Button bgColor="#15AA4B" on:click="goResumeCarrinho(totCarrinho)" width="80%">Carrinho - R$ {totCarrinho}</Button></div>
  <br>
  {/if}
  {#if !comercialTef}
  <div class="grid">
    <h6 class="message">Selecione o perfil que deseja acessar</h6>
  </div>
  <div>
    {#if entities.length > 0}
    <Collection>
      {#each entities as entitie}
      <Row label="{entitie.perfil_name}" on:click="goAreas(entitie)">
        <div slot="controller">
          <Icon symbol="chevron-right" />
        </div>
      </Row>
      {/each}
    </Collection>
    {/if}
  </div>
  {/if}
  {#if comercialTef}
  <div class="grid">
    <h6 class="message">Buscar uma transação por codigo: </h6>
  </div>
  <div class="row">
    <Input placeholder="Clique e digite" bind:value="codPreTransction" />
  </div>
  <br>
  <Button bgColor="#138C9F" on:click="getPreTransaction()" width="50%">Buscar</Button>
  <br>
  <br>
  {/if}
  <Button bgColor="#138C9F" on:click="viewQuestion1()" width="50%">Atualizar</Button>
  <br>
  {/if}
  {#if viewQuestion1}
    <br>
    <br>
    <div style="padding: 20px;">
      <h5>Atualizar</h5>
      <br>
      <br>
      <h5>Deseja atualizar ?</h5>
      <br>
      <br>
      <div class="row">
        <Button on:click="reloadingRequest()" bgColor="#138C9F" width="48%">Sim</Button>
        <Button on:click="viewQuestion1Negative()" bgColor="#FF0000" width="48%">Não</Button>
      </div>
    </div>
    {/if}
  {/if}
  {/if}
  <br>
  <Dialog title="Erro" ref:defaultDialog>
    Problema de conexão, favor reiniciar o aplicação.
  </Dialog>
  <Dialog title="Vazio" ref:vazioCarrinho>
    Carrinho está Vazio
  </Dialog>
  <Dialog title="Não localizado" ref:localizaDialog>
    Transação não encontrada
  </Dialog>
  <div ref:consolelog>

  </div>
</div>


<script>
  import Http from '@mamba/pos/api/http.js';
  import Storage from '@mamba/pos/api/storage.js';
  import Merchant from '@mamba/pos/api/merchant.js';

  export default {
    components: {
      AppBarModifier: '@mamba/appbar/Modifier.html',
      Icon: '@mamba/icon/Icon.html',
      Button: '@mamba/button/Button.html',
      Collection: '@mamba/collection/Collection.html',
      Row: '@mamba/collection/Row.html',
      Dialog: '@mamba/dialog/Dialog.html',
      Input: '@mamba/input',
    },
    data() {
      return {
        entities: [],
        loadgin: false,
        imgAssertive: false,
        reloadingRequestBollean: false,
        loadingCarrinho: false,
        entityGuidStoneCod: null,
        totCarrinho: '0,00',
        viewQuestion1: false,
        comercialTef: false,
        codPreTransction: null,
      };
    },
    oncreate() {
      if (!Storage.get('reload')) {
        this.goInitEntity();
      } else {
        const ret = Storage.get('EntityAndAreas');
        this.doRequest(JSON.parse(ret));
      }
      Storage.set('reload', true);
    },
    ondestroy() {
      Storage.set('reload', 'true');
    },
    methods: {
      goInitEntity() {
        let stoneId = null;
        let conectForm = null;
        let urlUse = null;
        conectForm = 'NET';
        urlUse = 'https://api.siclospag.com.br/';

        stoneId = '130053785'; 

        Storage.set('url', urlUse);
        Storage.set('connectRequest', conectForm);
        Storage.set('merchant', stoneId);

        const object = {
          method: 'GET',
          url: `${urlUse}pos/mamba/entities-and-areas-teste-pos`,
          headers: {
            'authorization': stoneId,
            'Cache-Control': 'no-cache',
          },
          connect: conectForm,
        };
        const that = this;
        this.set({ loadgin: true });
        Http.send(object).then((result) => {
          const ret = JSON.parse(result);
          if (ret.status === 202) {
            that.doRequest(ret, that);
            that.set({ reloadingRequestBollean: false });
            return;
          }
          if (ret.error === 'User not authorized. Please contact admin') {
            that.set({ loadgin: false });
            that.root.router.go('/is-not-entity');
            return;
          }
          that.set({ loadgin: false });
          that.set({ reloadingRequestBollean: true });
          const openDialog = 'defaultDialog';
          that.refs[openDialog].open(3000);
        })
          .catch((error) => {
            that.set({ loadgin: false });
            that.set({ reloadingRequestBollean: true });
            // if the request fails
            console.log(error);
          });
      },
      reloadingRequest() {
        this.viewQuestion1Negative();
        Storage.set('reload', false);
        Storage.set('areasTransaction', null);
        this.goInitEntity();
      },
      viewQuestion1(){
        this.set({ viewQuestion1: true});
      },
      viewQuestion1Negative(){
        this.set({ viewQuestion1: false});
      },
      goResumeCarrinho(tot) {
        if (tot === '0,00') {
          const openDialog = 'vazioCarrinho';
          this.refs[openDialog].open(3000);
          return;
        }
        this.root.router.go('/carrinho');
      },
      goAreas(data) {
        const { loadingCarrinho, entityGuidStoneCod } = this.get();
        Storage.set('areasEntity', JSON.stringify(data.areas));
        const entityAreas = JSON.parse(Storage.get('EntityAndAreas'));
        Storage.set('entity', JSON.stringify(
          {
            guid: data.guid,
            perfil_name: data.perfil_name,
            pos_perfil: data.pos_perfil,
            type: data.type,
            mini_name: data.mini_name,
            print_via_detailed: data.print_via_detailed,
            print_loop: data.print_loop,
            loadingCarrinho,
            entityGuidStoneCod,
            mini_name_m: entityAreas.mini_name_m,
            pos_perfil_m: entityAreas.pos_perfil_m,
            print_via_detailed_m: entityAreas.print_via_detailed_m,
            print_loop_m: entityAreas.print_loop_m,
            not_identification: entityAreas.not_identification,
          },
        ));
        this.root.router.go('/checkout');
      },
      doRequest(ret) {
        console.log(ret);
        Storage.set('EntityAndAreas', JSON.stringify(ret));
        this.set({ loadgin: false });
        this.loadingImg(ret.loadingImg, this);

        if(ret.comercialTef){
          this.set({ comercialTef: true });
          return;
        }
        const entities = ret.data;
        for (let i = 0; i < entities.length; i++) {
          const teste = entities[i].perfil_name.length;
          if (teste > 22) {
            entities[i].perfil_name = `${entities[i].perfil_name.substring(0, 21)}...`;
          }
        };
        this.set({ entities: ret.data });

        // Logica que define se será impĺementado carrinho para compras em multiplas entidades
        if (ret.loadingCarrinho) {
          this.set({ loadingCarrinho: true });
        } else {
          this.set({ loadingCarrinho: false });
        }
        this.set({ entityGuidStoneCod: ret.entityGuidStoneCod });
        let areasTransactionOldNotJ = Storage.get('areasTransaction');
        if (areasTransactionOldNotJ) {
          areasTransactionOldNotJ = JSON.parse(areasTransactionOldNotJ);
          if (areasTransactionOldNotJ) {
            if (areasTransactionOldNotJ.entities.length > 0) {
              this.set({
                totCarrinho: areasTransactionOldNotJ.amount.totalToShow,
              });
            };
          }
        };
        if (!areasTransactionOldNotJ) {
          this.set({
            totCarrinho: '0,00',
          });
        }
      },
      loadingImg(type, that) {
        if (type === 1) {
          that.set({ imgAssertive: false });
        };
        if (type === 2) {
          that.set({ imgAssertive: true });
        };

      },
      getPreTransaction(){
        const { codPreTransction } = this.get();
        const object = {
          method: 'GET',
          url: `${Storage.get('url')}pos/mamba/pre-transaction/${codPreTransction}`,
          headers: {
            'authorization': Storage.get('merchant'),
            'Content-Type': 'application/json; charset=UTF-8',
          },
          connect: Storage.get('connectRequest'),
        };
        this.set({ loadgin: true });
        Http.send(object).then((result) => {
          const ret = JSON.parse(result);
          this.set({ loadgin: false });
          if(ret.status === 202){
            // Caso Conseguiu localizar
            this.contructionApiTransaction(ret.transactionComplete);
            return;
          }
          if(ret.status === 400){
            const defaultDialog = 'localizaDialog';
            this.refs[defaultDialog].open(2000);
            return;
          }
          const defaultDialog = 'defaultDialog';
          this.refs[defaultDialog].open(3000);

        }).catch((error) => {
          this.set({ loadgin: false });
          const defaultDialog = 'defaultDialog';
          this.refs[defaultDialog].open(3000);
          console.log(error);
        });
      },
      contructionApiTransaction(transaction){
        const entityAreas = JSON.parse(Storage.get('EntityAndAreas'));
        const { codPreTransction } = this.get();
        const areasToPay = {
          userId: transaction.user_id,
          guid: transaction.guid,
          loadingCarrinho: false,
          TefApi: true,
          codPreTransction,
          mini_name: entityAreas.mini_name_m,
          returnObj: entityAreas.pos_perfil_m,
          print_via_detailed: entityAreas.print_via_detailed_m,
          print_loop: entityAreas.print_loop_m,
          not_identification: entityAreas.not_identification,
          amount : {
            totalToShow: transaction.amount.totalToShow,
            entityGuid: transaction.amount.entityGuid,
            amount: transaction.amount.amount,
          },
          entities: transaction.entites,
        };
        if(transaction.user_id){
          areasToPay.name = transaction.name;
        }
        Storage.set('areasTransaction', JSON.stringify(areasToPay));
        this.root.router.go('/carrinho');


      },
    },
  };

</script>

<style type="text/postcss">
  .message {
    text-align: center;
    background-color: white;
  }
</style>
