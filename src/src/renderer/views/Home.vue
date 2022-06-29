<template>


  <div id="layerForm">
    
    <section class="hero is-dark is-bold">
      <div class="hero-body">
        <div class="has-text-centered" style="height: 118px;">
          <figure class="image is-128x128">
            <!-- <img alt="Placeholder image" src="../../../_icons/512pxblue.png" /> -->
            <img src="https://hamonikr.org/layouts/hamonikr-join2/images/logo.png">
          </figure>
        </div>
        
        <div class="content has-text-centered" v-if="showLicense">
          <h1 class="title is-4">Hamonikr - OS (Git Mngr Tools)</h1>
            
            <div id="licenseInfoLayer" class="text-center orange">
              <span>{{infoText}} </span>
            </div>

          <md-field> <label>Git Url 입력</label> <md-input v-model="licenseTxt" @click="licenseTextClear()" :disabled='isActive'></md-input> 
          <md-button class="md-primary md-raised" @click="licenseSubmit()" :disabled='isActive'>Submit</md-button> </md-field>
          {{pushMessage}}
         <p v-if="errorshow">
          <ul>
            <li v-for="error in errors">{{error.text}}</li>
          </ul>
         </p>
        </div>
        <div class="content has-text-centered" v-if="showUpdate">
          Hamonikr License Application Updating......<br>
          {{updateMsg}}
          <br>
          {{updateProgress}}
        </div>
        <div>
          <h2>Hamonikr Auth Version : {{appversion}}</h2>
        </div>

          <!--
          <RouterLink class="button is-primary" to="about">
            <i class="material-icons">info</i>
            <span>About</span>
          </RouterLink>
          <RouterLink class="button is-primary" to="help">
            <i class="material-icons">help</i>
            <span>Help</span>
          </RouterLink>
          <br /><br /><br />
          -->
      </div>
    </section>
  </div>
</template>




<script lang="ts">

import Vue from 'vue'
import { ipcRenderer } from 'electron'
import axios from 'axios';
import https from 'https';

const vueLog = require('electron-log');
vueLog.transports.file.resolvePath = () => process.cwd() + '/.config/hamonikrAuth/logs/viewlog.log';

enum TEST {}


export default Vue.extend({
  name: 'Home',
  
  data() { 
    return { 
      // licenseTxt: 'https://github.com/hamonikr/hamonikr5.0-hamonikr-core', 
      licenseTxt: 'https://github.com/hamonikr/hamonize', 
      appversion: '1.0',
      infoText:'Git Manage Tool',
      pushMessage: '',
      SearchResults:[],
      polling: null,
      isActive: false,
      errors: [
        { text: '' }
      ],
      errorshow:false, 
      showLicense:true,
      showUpdate:false,
      updateMsg:'업데이트 파일 확인중입니다....',
      updateProgress: '',
    } 
  }, 
  created() {
      // get License Number 
      // ipcRenderer.send("app_version", ""); 
      // ipcRenderer.on("view_app_version", (event, args) => {
      //   ipcRenderer.removeAllListeners('app_version');
      //   this.appversion= args.version;
      // });


      // // update check
      // ipcRenderer.on("view_update-available", (event, args) => {
      //   this.showLicense = false;
      //   this.showUpdate = true;

      //   ipcRenderer.send("update-downloaded"); 

      // });


      // // update download
      // ipcRenderer.on("view_update-downloaded", (event, args) => {
      //   this.showLicense = false;
      //   this.showUpdate = true;
      //   this.updateMsg = '업데이트 다운로드가 완료되었습니다. ';

      //   ipcRenderer.send("restart_app");
      // });
      // // update download pregress
      // ipcRenderer.on("view_download-progress", (event, args) => {
      //   this.updateProgress = args;
      // });

      // ipcRenderer.send("update-not-available", "");
      // ipcRenderer.on("view_update-not-available", (event, args) => {
      //   vueLog.info(`application status :: ${args}` );
      //   // ipcRenderer.send("readLiecenseFile", "");
      //   this.pollData();
      // });

      
      // // 라이선스 파일 여부 체크 return Y/N
      // ipcRenderer.on("readLiecenseFileResult", (event, args) => {
      //   vueLog.info(`Application Init] - License Check Result is :: ${args}`);
      //   if( args === 'Y' ){
      //     this.infoText = "하모니카 라이센스 인증이 완료되었습니다.";
      //     this.isActive = true;
      //   }
      // });
      



  },
  mounted() {
    this.pushMessage = '';
    // setInterval(this.pollData, 3600000);
  }, 
  methods: { 
    
    // pollData () {
    //   ipcRenderer.send("ChkLicenseProc", "");
      
    //   ipcRenderer.on("ChkLicenseProcResult", (event, args) => {
    //     vueLog.info(`ChkLicenseProcResult] - :: ${args}`);
    //     if( args === 'N' ){
          
    //       this.pushMessage = '';
    //       this.errors = [];
          
    //       this.pushMessage = "비인증된 Hamonikr-OS (KIOSK)입니다.  License 인증을 진행해 주세요..";
    //       this.isActive = false;
    //     }else{
    //       this.pushMessage = "Hamonikr-OS (KIOSK) 라이센스 인증 완료.!!!";
    //       this.isActive = false;
    //     }
    //   });

    // },
    isComplete(){
      return true;
    },
    licenseTextClear(){
      this.errors = [];
      this.errorshow = false;
    },
    clearAll(){
      this.licenseTxt = '';
    }, 
    validationCheck(){
      
      this.pushMessage = '';
      this.errors = [];
      vueLog.info(`Input License Number is :: ${this.licenseTxt} , Length() is :: ${this.licenseTxt.length}`);

      if( this.licenseTxt.length == 0 ){
        this.errors.push( { text: 'Git 저장소를 입력해주세요' } );
        this.errorshow = true;
        return ;
      }else{
        // this.sendLicenseNumber();
        this.getRepos_axios();
        // this.getGitRepoList();
        
        //  ipcRenderer.send('ChkGitRepositoryProc', 'a');
      }
    },
    licenseSubmit () { 
      this.validationCheck();
    },
    async getGitRepoList(){
      const fileList = await this.aaa();
      vueLog.info("fileList========++"+JSON.stringify(fileList))
    }, 
    
    
    
    
    
    
    
    // axiosTest() {
    //   return axios.get(url).then(response => response.data)
    // },

   async aaa(){
      const asd = await axios.get("https://api.github.com/repos/hamonikr/hamonize/contents", {headers: {Authorization: "token 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"}});
     vueLog.info(asd.data);
      for (const datatmp of asd.data) {
        if( datatmp.name == '.github'){
          vueLog.info("---------"+datatmp.url) // 1
          return await axios.get(datatmp.url, {headers: {Authorization: "token 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"}});
        }
      }
      return asd.data;
    },
    async getRepos_axios() {
       await axios
        .get("https://api.github.com/repos/hamonikr/hamonize/contents", {headers: {Authorization: "token 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"}})
        // .get("https://api.github.com/repos/hamonikr/hamonize")
        .then(response => {
          console.log("response.status=======+++"+ response.status);
          // const datas = response.data;
          // for (const data of datas) {
          //   vueLog.info(data)
          // }
          // ipcRenderer.send('ChkGitRepositoryProc', datas);

          let ArrayFileName = [];
          let ArrayDirName = [];

          const datas = response.data;
          for (const data of datas) {

            let gitFileName = data.name;
            if (gitFileName.trim() != '' && data.type == "file") {
              ArrayFileName.push({
                "name": data.name.toUpperCase().replace(/\./, ''),
                "type": data.type,
                "url": data.url,
                "description": data.description
              });
            }
            if (gitFileName.trim() != '' && data.type == "dir") {
              ArrayDirName.push({
                "name": data.name.toUpperCase(),
                "type": data.type,
                "url": data.url,
                "description": data.description
              });
            }
          }

          ipcRenderer.send('ChkGitRepositoryProc', ArrayFileName, ArrayDirName);
        }).catch(function (error) {
          vueLog.info(error)
        })
    },


    sendLicenseNumber(){
      var vm = this;
          vueLog.info("github url :: " +this.licenseTxt);
          var stepASplit = this.licenseTxt.split('://');
          // for ( var i in stepASplit ) {
          //   document.write( '<p>' + stepASplit[i] + '</p>' );
          // }
          // document.write( '<p>-----------------</p>' );
          var stepBSplit = stepASplit[1].split('/');
          // for ( var i in stepBSplit ) {
          //   document.write( '<p>' + stepBSplit[i] + '</p>' );
          // }
          // document.write( '<p>-----------------</p>' );
          // document.write( '<p>-----------------</p>' );

          // document.write( '<p>' + stepBSplit[1] + '</p>' );
          // document.write( '<p>' + stepBSplit[2] + '</p>' );
          let gitRepo = '';
          if( stepBSplit[2].indexOf('.git') > -1  ){
            gitRepo = stepBSplit[2].split('.')[0];
          }else{
            gitRepo = stepBSplit[2];
          }

       

          let gitRepoUrl = "https://api.github.com/repos/" + stepBSplit[1] +"/"+ gitRepo+"/contents/";
          axios.get(gitRepoUrl)
                  .then( function (response)
                  {
                    var newContent = '';
                    // console.log(response.data);
                    // vueLog.info(`License Check Step 1-2 ] - License Check Result is :: ${JSON.stringify(response.data)}`);


                    // ipcRenderer.send('ChkGitRepositoryProc', response.data);

                    // newContent += '<h1>repository in GitHub.</h1>';
 
                    // let occupation = [];
                    // let ArrayFileName = [];
                    // let ArrayDirName = [];

                    // for (var i = 0; i < response.data.length; i++) {
                    //   let gitFileName = response.data[i].name;
                    //   newContent += '<li>' ;
                    //   newContent += '<span> File Name -> ' + gitFileName+ '</span><br>' ;
                    //   newContent += '<span> File Type -> ' + response.data[i].type+ '</span><br>';
                    //   newContent += '<span > Url -> '+ response.data[i].url + '</span>';
                    //   newContent += '</li><br>';
                      
                    //   var chkFilename = gitFileName.replace(/\..+$/, '');
                    //   // vueLog.info(`----------> ${chkFilename}`);
                    //   // occupation.push(chkFilename)


                    //   if( chkFilename.trim() != '' && response.data[i].type == "file" ){
                    //       ArrayFileName.push(chkFilename);
                    //   }
                    //   if( chkFilename.trim() != '' && response.data[i].type == "dir" ){
                    //       ArrayDirName.push(chkFilename);
                    //   }


                    // }
                    // newContent += '</ul></div>';
                    // // document.write( newContent );


                    // vueLog.info("file nm ==" + ArrayFileName);
                    // vueLog.info("dir nm ==" + ArrayDirName);

                    // var chkFileBaseNm = ['README', 'LICENSE', 'SECURITY', 'CONTRIBUTING'];
                    // vueLog.info("chkFileBaseNm======"+ chkFileBaseNm);
                    // vueLog.info("ArrayFileName========"+ ArrayFileName);


                    // const first = new Set(chkFileBaseNm);
                    // const second = new Set(ArrayFileName);

                    // const difference = [...first].filter(data => !second.has(data));
                    // vueLog.info('difference---'+difference); 

                    

                    // var jsonData = response.data;
                    // vueLog.info(`License Check Step 1-2 ] - License Check Result is :: ${JSON.stringify(jsonData)}`);
                    // if( jsonData.output == 'N' ){
                    //   vm.errors.push( { text: '유효하지않는 라이센스 번호입니다.!!!!!!!!!' } );
                    //   vm.errorshow = true;
                    //   vm.clearAll();
                    // }else if( jsonData.output == 'DN' ){
                    //   vm.pushMessage = '라이센스 기간이 완료된 라이센스입니다.';
                    //   vm.clearAll();
                    // }else if( jsonData.output == 'DUN' ){
                    //   vm.pushMessage = '사용중인 라이센스입니다..';
                    //   vm.clearAll();
                    // }else if( jsonData.output == 'Y' ){
                    //   // Step 3. License Data Save 
                    //   ipcRenderer.send('licenseSubmitProc', jsonData.lcnsno.trim());
                    // }
                  })        
                  .catch(function (error) {
                    console.log("error======+++"+error);
                    // vm.pushMessage = 'Git Repository Check Error<Hamonikr Team>으로 문의 주시기 바랍니다. ';
                    vm.errors.push( { text: 'Git Repository Check Error. <Hamonikr Team>으로 문의 주시기 바랍니다.!!! '} );
                    vm.errorshow = true;
                    vm.clearAll();
                  })
      // });
      // Step 3. License Data Save 
      // ipcRenderer.once("isBoolLicense", (event, args) => {
      //   console.log("args=============="+ args);
      //   // this.pushMessage = "라이센스 등록이 정상처리 되었습니다.";
      //   vm.errors.push( { text: 'Git Repository Check Success.!!! '} );
      //   vm.errorshow = true;
      //   setTimeout(function(){
      //     location.reload();
      //   },3000);
      // });
      
    }

  }
})
</script>


<style>
.hero-body {
  height: 100vh;
}

</style>
