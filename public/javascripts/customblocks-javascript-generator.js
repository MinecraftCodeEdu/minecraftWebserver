/************************************************************************
## Blockly -> ScriptCraft Javascript Code generator
Lauro Canonica: Original author (Devoxx4kids Lugano 2015.04)

Contains the generator for the javascript used in scriptcraft

***/

/*
** javascript get IP Address from RTC
*/

/*
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
    if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
    window.myIP = /([1-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1].toString().replace(/[:.]/gi,'');


  //A class : 10.0.0.0 ~ 10.255.255.255
  //B class : 172.16.0.0 ~ 172.31.255.255
	     
    //console.log(JSON.stringify(myIP)); 
    //document.getElementById("clientIP").innerHTML = myIP.toString().replace(/[:.]/gi,'');
    pc.onicecandidate = noop;
    };
*/

function getIPs(callback){
                var ip_dups = {};
                //compatibility for firefox and chrome
                var RTCPeerConnection = window.RTCPeerConnection
                    //|| window.mozRTCPeerConnection
                    || window.webkitRTCPeerConnection;
                var useWebKit = !!window.webkitRTCPeerConnection;
                //bypass naive webrtc blocking using an iframe
                if(!RTCPeerConnection){
                    //NOTE: you need to have an iframe in the page right above the script tag
                    //
                    //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                    //<script>...getIPs called in here...
                    //
                    var win = iframe.contentWindow;
                    RTCPeerConnection = win.RTCPeerConnection
                        || win.mozRTCPeerConnection
                        || win.webkitRTCPeerConnection;
                    useWebKit = !!win.webkitRTCPeerConnection;
                }
                //minimal requirements for data connection
                var mediaConstraints = {
                    optional: [{RtpDataChannels: true}]
                };
                var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
                //construct a new RTCPeerConnection
                var pc = new RTCPeerConnection(servers, mediaConstraints);
                function handleCandidate(candidate){
                    //match just the IP address
                    var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
                    var ip_addr = ip_regex.exec(candidate)[1];
                    //remove duplicates
                    if(ip_dups[ip_addr] === undefined)
                        callback(ip_addr);
                    ip_dups[ip_addr] = true;
                }
                //listen for candidate events
                pc.onicecandidate = function(ice){
                    //skip non-candidate events
                    if(ice.candidate)
                        handleCandidate(ice.candidate.candidate);
                };
                //create a bogus data channel
                pc.createDataChannel("");
                //create an offer sdp
                pc.createOffer(function(result){
                    //trigger the stun server request
                    pc.setLocalDescription(result, function(){}, function(){});
                }, function(){});
                //wait for a while to let everything done
                setTimeout(function(){
                    //read candidate info from local description
                    var lines = pc.localDescription.sdp.split('\n');
                    lines.forEach(function(line){
                        if(line.indexOf('a=candidate:') === 0)
                            handleCandidate(line);
                    });
                }, 1000);
}

getIPs(function(ip){
  window.myIP = ip.toString().replace(/[:.]/gi,'');
});

/*
 * 드론
 */
Blockly.JavaScript['drone'] = function (block) {
    var fname = block.getFieldValue('param');
    var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
    var webip = window.myIP;

    var code = "command( '" + webip + fname + "', function ( parameters, player ) {\nvar delay_add=0;\nvar theDrone = new Drone(player);\nglobal.theDrone = theDrone;\nvar bkBlockFace = Packages.org.bukkit.block.BlockFace;\nvar bkItemStack = Packages.org.bukkit.inventory.ItemStack;\nvar bkMaterial = Packages.org.bukkit.Material;\nvar bkLocation = Packages.org.bukkit.Location;\nglobal.theDrone.up();\nglobal.theDrone.chkpt('start');\n";
    code = code + "var timeoutStop = new Date().getTime()+500;\n"; // set maximum run time for a script
    code = code + statements_statements;
    code = code + "});";
    return code;
};

/*
Blockly.JavaScript['drone'] = function (block) {
    var fname = block.getFieldValue('param');
    var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
    var webip = window.myIP;

    var code = "command( '" + fname + "', function ( parameters, player ) {\n";
    code = code + " if ( " + webip + "  == player.getAddress().getAddress().getHostAddress().replace(/[:.]/gi,'') ) {  \n";
    code = code + "var theDrone = new Drone(player);\nvar bkItemStack = Packages.org.bukkit.inventory.ItemStack;\nvar bkMaterial = Packages.org.bukkit.Material;\nvar bkLocation = Packages.org.bukkit.Location;\ntheDrone.up();\ntheDrone.chkpt('start');\nvar timeoutStop = new Date().getTime()+500;\n"; // set maximum run time for a script
    code = code + statements_statements;
    code = code + "} else{ print('function is not defined')  }\n";
    code = code + "});\n";

    return code;
};
*/

Blockly.JavaScript['drone_move'] = function (block) {
    var dropdown_direction = block.getFieldValue('direction');
    var code = "global.theDrone." + dropdown_direction + ";\n";
    return code;
};

Blockly.JavaScript['drone_move_count'] = function (block) {
    var dropdown_direction = block.getFieldValue('direction');
    var value_count = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_ATOMIC);
    var code = "global.theDrone." + dropdown_direction + "(" + value_count + ");\n";
    return code;
};

Blockly.JavaScript['materials'] = function (block) {
    var dropdown_material = block.getFieldValue('material');
//    JSON.stringify(dropdown_material).replace('1','10');
//    var code = "theDrone." + 'box(' + JSON.stringify(dropdown_material) + ');\n';
var code = "global.theDrone.box(" + JSON.stringify(dropdown_material).replace(/"/g,"").replace(".",":")+ ");\n";

    return code;
};

Blockly.JavaScript['animals'] = function (block) {
    var dropdown_animal = block.getFieldValue('animal');
    var code = "if (__plugin.bukkit) {\n        global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType." + dropdown_animal + ");\n    }\n    if (__plugin.canary) {\n ar Canary = Packages.net.canarymod.Canary,\n            entityInstance = Canary.factory().entityFactory.newEntity('" + dropdown_animal + "', global.theDrone.getLocation());\n        entityInstance.spawn();\n    }";
    return code;
};

Blockly.JavaScript['trees'] = function (block) {
    var dropdown_tree = block.getFieldValue('tree');
    var code = "global.theDrone.getLocation().world.generateTree(global.theDrone.getLocation(), org.bukkit.TreeType."+dropdown_tree+");";
    return code;
};


Blockly.JavaScript['rectangle'] = function (block) {
    var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
    var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_material = block.getFieldValue('material');
    var dropdown_fill = block.getFieldValue('fill');
    var code = "global.theDrone.box" + dropdown_fill + "(" + JSON.stringify(dropdown_material).replace(/"/g,"").replace(".",":") + "," + value_width + ",1," + value_length + ");\n";

    return code;
};

Blockly.JavaScript['circle'] = function (block) {
    var value_radius = Blockly.JavaScript.valueToCode(block, 'radius', Blockly.JavaScript.ORDER_ATOMIC);
    var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_material = block.getFieldValue('material');
    var dropdown_fill = block.getFieldValue('fill');
    var code = "global.theDrone.cylinder" + dropdown_fill + "(" + JSON.stringify(dropdown_material).replace(/"/g,"").replace(".",":") + "," + value_radius +","+value_height+");\n";	
    return code;
};

Blockly.JavaScript['prism'] = function(block) {
  var dropdown_shape = block.getFieldValue('SHAPE');
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_material = block.getFieldValue('MATERIAL');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.prism" + dropdown_shape + "(" + dropdown_material + "," + value_width + "," + value_length + ");\n";
  return code;
};

Blockly.JavaScript['delete'] = function (block) {
    var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
    var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);
    var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
    var code = "global.theDrone.box(0," + value_width + "," + value_height + "," + value_length + ");\n";
    return code;
};

Blockly.JavaScript['drone_mutator'] = function(block) { /*드론 Mutator 메인 블록*/
  // TODO: Assemble JavaScript into code variable.
  var code = new Array(block.itemCount_);

  for (var n = 0; n < block.itemCount_; n++) {
    var drone = Blockly.JavaScript.valueToCode(block, 'DRONE' + n,
        Blockly.JavaScript.ORDER_NONE) || 'None';
    code[n] = drone;
  }
  code = "global.theDrone." + code.join(".") + ";\n";
  return code;
	
};

Blockly.JavaScript['materials_var'] = function(block) {  /*재료 변수블록*/
  var dropdown_material = block.getFieldValue('material');
  // TODO: Assemble JavaScript into code variable.
  var code = "box("+dropdown_material+")";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['drone_move_var'] = function(block) {  /*드론움직임 변수*/
  var dropdown_direction = block.getFieldValue('direction');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_direction;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.JavaScript['door'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  var dropdown_material = block.getFieldValue('MATERIAL');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone."+dropdown_type+dropdown_material+"();\n";
  return code;
};

Blockly.JavaScript['ladder'] = function(block) {
  var value_height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.ladder("+value_height+");\n";
  return code;
};

Blockly.JavaScript['torch'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.hangtorch("+dropdown_type+");\n";
  return code;
};

Blockly.JavaScript['player_direction'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = "Drone.PLAYER_STAIRS_FACING[global.theDrone.dir]";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['spiral_stair'] = function(block) {
  var dropdown_material = block.getFieldValue('MATERIAL');
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_flights = Blockly.JavaScript.valueToCode(block, 'FLIGHTS', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.spiral_stairs('"+dropdown_material+"',"+value_width+","+value_flights+");\n";
  return code;
};

Blockly.JavaScript['inventory'] = function (block) {
    var fname = block.getFieldValue('param');
    var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
    var webip = window.myIP;

    var code = "var inventory = require('inventory');\nvar items = require('items');\ncommand( '" + webip + fname + "', function ( parameters, player ) {\nvar theInventory = new inventory(player);\n";
    code = code + "var timeoutStop = new Date().getTime()+500;\n"; // set maximum run time for a script
    code = code + statements_statements;
    code = code + "});";
    return code;
};


/*
Blockly.JavaScript['inventory'] = function (block) {
	var fname = block.getFieldValue('param');
	var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
	var webip = window.myIP;
	
	var code = "var inventory = require('inventory');\nvar items = require('items');\ncommand( '" + fname + "', function ( parameters, player ) {\n";
	code = code + " if ( " + webip + "  == player.getAddress().getAddress().getHostAddress().replace(/[:.]/gi,'') ) {  \n";
	code = code + "var theInventory = new inventory(player);\nvar timeoutStop = new Date().getTime()+500;\n"; // set maximum run time for a script
	code = code + statements_statements;
	code = code + "} else{ print('function is not defined')  }\n";
	code = code + "});\n";
	return code;
};
*/

Blockly.JavaScript['weapons_armor'] = function (block) {
    var dropdown_item = block.getFieldValue('item');
    var code = "theInventory.add(items." + dropdown_item + "(1))" + ";\n";
    return code;
};


Blockly.JavaScript['tools'] = function (block) {
    var dropdown_item = block.getFieldValue('item');
    var code = "theInventory.add(items." + dropdown_item + "(1))" + ";\n";
    return code;
};

Blockly.JavaScript['food'] = function (block) {
    var dropdown_item = block.getFieldValue('item');
    var code = "theInventory.add(items." + dropdown_item + "(1))" + ";\n";
    return code;
};

Blockly.JavaScript['transportation'] = function (block) {
    var dropdown_item = block.getFieldValue('item');
    var code = "theInventory.add(items." + dropdown_item + "(1))" + ";\n";
    return code;
};

/*
 * 사냥하고 돌아오기
 */
Blockly.JavaScript['onchat'] = function(block) { /* 채팅명령어 */
	var value_command = Blockly.JavaScript.valueToCode(block, 'command', Blockly.JavaScript.ORDER_ATOMIC);
	var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
	var webip = window.myIP;
	// TODO: Assemble JavaScript into code variable.

	var code = "\
command( '" + webip + value_command.replace(/'/g,"") + "', function ( parameters, player ) {\n\
  var playerLocation = player.getLocation();\n\
  var delay_add=0;\n\
  var theDrone = new Drone(player);\n\
  global.theDrone = theDrone;\n\
  global.theDrone.up();\n\
  global.theDrone.chkpt('start');\n\
" + statements_statements + "\
});\
";

	
    return code;
};

Blockly.JavaScript['spawn_animal'] = function(block) { /* 동물 소환 */
        var value_animal = Blockly.JavaScript.valueToCode(block, 'animal', Blockly.JavaScript.ORDER_ATOMIC);
        // TODO: Assemble JavaScript into code variable.
        var dropdown_age = block.getFieldValue('AGE');
        var checkbox_saddle = block.getFieldValue('SADDLE') == 'TRUE';
        var horse = "'CraftHorse{variant=HORSE, owner=null}'";
        var tryError = "'말 이외에는 안장사용불가'";
        var code = "var animal_type = global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType." + value_animal + ");\n\
animal_type."+ dropdown_age +";\n\
if(animal_type=="+horse+"){animal_type.setTamed(true);}\n\
if("+checkbox_saddle+"){\n\
  try{\n\
var bkMaterial = Packages.org.bukkit.Material;\n\
var bkItemStack=Packages.org.bukkit.inventory.ItemStack;\n\
animal_type.getInventory().setSaddle(new bkItemStack(bkMaterial.SADDLE));\n\
  } catch(e){player.chat("+tryError+")}\n}\n";

  return code;
};

Blockly.JavaScript['animalmob'] = function(block) { /* 동물 */
  //var dropdown_animal = block.getFieldValue('ANIMAL');
  // TODO: Assemble JavaScript into code variable.
  var code = block.getFieldValue('ANIMAL');
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['onmobkilled'] = function(block) { /* 동물이 죽었을 때 */
  var value_mob = Blockly.JavaScript.valueToCode(block, 'Mob', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_command = Blockly.JavaScript.statementToCode(block, 'command');
  var webip = window.myIP;
  // TODO: Assemble JavaScript into code variable.
  var code = "\
events.entityDeath( function( event ) {\n\
  var player = event.getEntity().getKiller();\n\
  var playerIP = player.getAddress().getAddress().getHostAddress().replace(/[:.]/gi,'');\n\
  if( "+webip+" == playerIP ) {\n\
    if( event.getEntity().getType() == '"+value_mob+"' ) {\n"
	+ statements_command +"\
    } //entityType endif\n\
  } //playerIP endif\n\
}); //endEvent";

  return code;
};

Blockly.JavaScript['teleport_location'] = function(block) { /* 좌표로 텔레포트 */
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "var bkLocation = Packages.org.bukkit.Location;\n"
			+"player.teleport("+value_name+");\n";
  return code;
};

Blockly.JavaScript['absolute_location'] = function(block) { /* 절대 좌표 */
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'z', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "new bkLocation(player.world, "+value_x+", "+value_y+", "+value_z+")";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['relative_location'] = function(block) { /* 상대 좌표 */
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'z', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "new bkLocation(player.world, player.getLocation().x+Number("+value_x+"), player.getLocation().y+Number("+value_y+"), player.getLocation().z+Number("+value_z+") )";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['player_chatcommand'] = function(block) { /* 채팅명령어 실행 */
  var chatcommand = Blockly.JavaScript.valueToCode(block, 'chatcommand', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "player.chat('/jsp '+"+chatcommand+");\n";
  return code;
};

/*
 * 보물찾기
 */
Blockly.JavaScript['moveforward'] = function(block) { /* 숫자만큼 앞으로 이동 */
  var value_distance = Blockly.JavaScript.valueToCode(block, 'distance', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.

  var code = "\
var distance = "+value_distance+";\n\
var yaw = ((playerLocation.getYaw()+90)*Math.PI)/180;\n\
var x = Math.cos(yaw);\n\
var z = Math.sin(yaw);\n\
playerLocation.add(x*distance, 0, z*distance);\n\
player.teleport(playerLocation);\n\
";

  return code;
};

Blockly.JavaScript['directforward'] = function(block) { /* 숫자만큼 앞으로 이동 명령어 */
  var value_command = Blockly.JavaScript.valueToCode(block, 'command', Blockly.JavaScript.ORDER_ATOMIC);
  var webip = window.myIP;
  // TODO: Assemble JavaScript into code variable.
  var code = "command( '"+webip+value_command.replace(/'/g,"")+"', function ( parameters, player ) {\n\
  var bkLocation = org.bukkit.Location;\n\
  var world = player.getWorld();\n\
  var loc = player.getLocation();\n\
  if(isNaN(Number(parameters[0]))){\n\
    player.sendMessage('please input number.');\n\
    return false;\n\
  }\n\
  var distance = parameters[0];\n\
  var yaw  = ((loc.getYaw() + 90)  * Math.PI) / 180;\n\
  var x = Math.cos(yaw);\n\
  var z = Math.sin(yaw);\n\
  player.teleport(new bkLocation(world, loc.getX()+x*distance,loc.getY(), loc.getZ()+z*distance, loc.getYaw(), loc.getPitch()));\n\
});\n";
  return code;
};

Blockly.JavaScript['setyaw'] = function(block) { /* 각도 바라보기 */
  var angle_yaw = block.getFieldValue('yaw');
  // TODO: Assemble JavaScript into code variable.
  var code = "\
playerLocation.setYaw("+angle_yaw+");\n\
playerLocation.setPitch(0);\n\
player.teleport(playerLocation);\n\
";
  return code;
};

Blockly.JavaScript['setdirection'] = function(block) { /* 방향 바라보기 */
  var dropdown_direction = block.getFieldValue('direction');
  // TODO: Assemble JavaScript into code variable.
  var code = "\
playerLocation.setYaw("+dropdown_direction+");\n\
playerLocation.setPitch(0);\n\
player.teleport(playerLocation);\n\
";
  return code;
};
/*
 * 술래잡기
 */
Blockly.JavaScript['notice_standing_block'] = function(block) { /* 위치 찾기 함수 */
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "\
var bkBk = org.bukkit.Bukkit;\n\
var bkBF = org.bukkit.block.BlockFace;\n\
var targetPlayer = bkBk.getPlayer("+value_player+");\n\
if(targetPlayer == null){\n\
	player.chat('There are no players named '+"+value_player+");\n\
} else {\n\
	var x = targetPlayer.getLocation().getBlockX();\n\
	var z = targetPlayer.getLocation().getBlockZ();\n\
	var blockType = targetPlayer.getWorld().getBlockAt(x, 0, z).getType();\n\
	player.chat('The '+targetPlayer.getName()+' is on the '+blockType+'.');\n\
}\n\
";
  return code;
};

Blockly.JavaScript['transform_block'] = function(block) { /* 위치 속이기 함수 */
  var dropdown_material = block.getFieldValue('material');
  // TODO: Assemble JavaScript into code variable.
  var code = "\
var x = player.getLocation().getBlockX();\n\
var y = player.getLocation().getBlockY();\n\
var z = player.getLocation().getBlockZ();\n\
var blockId = player.getWorld().getBlockAt(x, y-1, z).getTypeId();\n\
player.getWorld().getBlockAt(x, y-1, z).setTypeId("+dropdown_material+");\n\
setTimeout(function() { player.getWorld().getBlockAt(x, y-1, z).setTypeId(blockId) }, 5000);\n\
";
  return code;
};

Blockly.JavaScript['target_teleport'] = function(block) { /* 특정 플레이어 텔레포트 */
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var value_location = Blockly.JavaScript.valueToCode(block, 'location', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "\
  var bkBk = org.bukkit.Bukkit;\n\
  var bkLocation = Packages.org.bukkit.Location;\n\
  var targetPlayer = bkBk.getPlayer("+value_player+");\n\
  if(targetPlayer == null){\n\
	player.chat('There are no players named '+"+value_player+");\n\
  } else {\n\
  	targetPlayer.teleport("+value_location+");\n\
  }\n\
";
  return code;
};

Blockly.JavaScript['onentitydamage'] = function(block) { /* 엔티티가 데미지 입을 때 이벤트 */
  var value_player = Blockly.JavaScript.valueToCode(block, 'player', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_command = Blockly.JavaScript.statementToCode(block, 'command');
  var webip = window.myIP;
  // TODO: Assemble JavaScript into code variable.
    var code = "\
events.entityDamageByEntity( function( event ) {\n\
  var player = event.getDamager();\n\
  var playerIP = player.getAddress().getAddress().getHostAddress().replace(/[:.]/gi,'');\n\
  if( "+webip+" == playerIP ) {\n\
    if( event.getEntity().getName().equalsIgnoreCase("+value_player+")){\n"
+statements_command+"\
    } else {\n\
      event.setCancelled(true);\n\
    }\n\
  } // playerIP endif\n\
}); //endEvent";
  return code;
};

Blockly.JavaScript['random_teleport'] = function(block) { /* 랜덤 위치 텔레포트 */
  // TODO: Assemble JavaScript into code variable.
  var code = "\
var bkLocation = Packages.org.bukkit.Location;\n\
var x = parseInt(Math.random() * ( 149 - (-149) ) + -149);\n\
var z = parseInt(Math.random() * ( 149 - (-149) ) + -149);\n\
setTimeout(function() { player.teleport(new bkLocation(player.world, x, 1, z)); }, 60000);\n\
player.sendMessage('The position is moved after 60 seconds.');\n\
";
  return code;
};

Blockly.JavaScript['tag_rectangle'] = function (block) {  /* 술래잡기 직사각형 재료 */
    var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
    var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_material = block.getFieldValue('material');
    var dropdown_fill = block.getFieldValue('fill');
    var code = "global.theDrone.box" + dropdown_fill + "(" + JSON.stringify(dropdown_material).replace(/"/g,"").replace(".",":") + "," + value_width + ",1," + value_length + ");\n";

    return code;
};

/*
 * 농사짓기
 */

Blockly.JavaScript['dispenser_direction'] = function(block) {
  var dropdown_item = block.getFieldValue('ITEM');
  var value_name = Blockly.JavaScript.valueToCode(block, 'ITEM_COUNT', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var dropdown_item = dropdown_item.split(':');
  var value_block_location = Blockly.JavaScript.valueToCode(block, 'BLOCK_LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  var code = "\
player.getWorld().getBlockAt("+value_block_location+").setType(bkMaterial.DISPENSER);\n\
player.getWorld().getBlockAt("+value_block_location+").setData("+dropdown_direction+");\n\
\n\
var block = "+value_block_location+".getBlock();\n\
var dispenser = block.getState();\n\
var dispenserInv = dispenser.getInventory();\n\
containerInv.addItem(new bkItemStack('"+dropdown_item[0]+"', "+value_number+", "+dropdown_item[1]+"));\n\
";
  return code;
};

Blockly.JavaScript['dispenser_drone'] = function(block) {
  var dropdown_material = block.getFieldValue('MATERIAL');
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_number = Blockly.JavaScript.valueToCode(block, 'number', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var dispenser_num = '23';
  var dropdown_material = dropdown_material.split(':');

  var code = "\
var droneData = global.theDrone.box('" + dispenser_num + ":" + dropdown_direction + "');\n\
var block = droneData.getLocation().getBlock();\n\
block.setType(bkMaterial.DISPENSER);\n\
var container = block.getState();\n\
var containerInv = container.getInventory();\n\
\n\
containerInv.addItem(new bkItemStack('"+dropdown_material[0]+"', "+value_number+", "+dropdown_material[1]+"));\n\
";

  return code;
};

Blockly.JavaScript['block_direction'] = function(block) {
  var dropdown_item = block.getFieldValue('ITEM');
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box('" + dropdown_item + ":" + dropdown_direction + "'," + value_width + ",1," + value_length + ");\n";

  return code;
};

Blockly.JavaScript['material_position'] = function(block) {
  var dropdown_material = block.getFieldValue('MATERIAL');
  var value_position = Blockly.JavaScript.valueToCode(block, 'POSITION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  //  var code = "theDrone.right(" + value_x + ").up(" + value_y + ").fwd(" + value_z + ").box(" + dropdown_item + ");\n";
    var code = "\
var bkLocation = Packages.org.bukkit.Location;\n\
var blockLocation = "+value_position+";\n\
var block = blockLocation.getBlock();\n\
block.setTypeId("+dropdown_material+");\n\
";      

  return code;
};

Blockly.JavaScript['copy_place'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var value_length = Blockly.JavaScript.valueToCode(block, 'LENGTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.copy("+value_name+","+value_length+","+value_height+","+value_width+");\n";
  return code;
};

Blockly.JavaScript['paste_place'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.paste("+value_name+");\n";
  return code;
};

Blockly.JavaScript['controls_try'] = function(block) {

  // try catch
  var tryblock = Blockly.JavaScript.statementToCode(block, 'TRY');
  var catchblock = Blockly.JavaScript.statementToCode(block, 'CATCH');
  var code = 'try {\n' + tryblock + '}\n';
  code += "catch(err){ player.chat(err.message);\n" + catchblock + '\n}';
  return code + '\n';
};

Blockly.JavaScript['block_around_information'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = "var block_left = \"\";\nvar block_right = \"\";\nvar block_back = \"\";\nvar block_fwd = \"\";\n\
global.theDrone.chkpt('block');\n\
block_left = global.theDrone.left().getLocation().getBlock().getType();\n\
global.theDrone.move('block');\n\
block_right = global.theDrone.right().getLocation().getBlock().getType();\n\
global.theDrone.move('block');\n\
block_back = global.theDrone.back().getLocation().getBlock().getType();\n\
global.theDrone.move('block');\n\
block_fwd = global.theDrone.fwd().getLocation().getBlock().getType();\n\
global.theDrone.move('block');\n\
";
  return code;
};

Blockly.JavaScript['block_around'] = function(block) {
  var dropdown_material = block.getFieldValue('MATERIAL');
  var dropdown_exist = block.getFieldValue('EXIST');
  // TODO: Assemble JavaScript into code variable.
  var code = "block_left"+dropdown_exist+" '"+dropdown_material+"' || block_right"+dropdown_exist+" '"+dropdown_material+"' || block_back"+dropdown_exist+" '"+dropdown_material+"' || block_fwd"+dropdown_exist+" '"+dropdown_material+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


/*
 * 승마, 보트
 */
Blockly.JavaScript['two_dimension'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  var value_i = Blockly.JavaScript.valueToCode(block, 'i', Blockly.JavaScript.ORDER_ATOMIC);
  var value_j = Blockly.JavaScript.valueToCode(block, 'j', Blockly.JavaScript.ORDER_ATOMIC);
  var value_k = Blockly.JavaScript.valueToCode(block, 'k', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = text_name+"["+value_i+"]["+value_j+"]="+value_k+";\n";
  return code;
};

Blockly.JavaScript['drone_variable'] = function(block) {
  var value_material = Blockly.JavaScript.valueToCode(block, 'material', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box("+value_material+");\n";
  return code;
};

/*
 * 마을짓기, 폭격
 */
Blockly.JavaScript['redstone_comparator'] = function(block) {
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var checkbox_4 = block.getFieldValue('4') == 'TRUE';
  // TODO: Assemble JavaScript into code variable.
  if(checkbox_4) {
    var code = "global.theDrone.box('149:" + (Number(dropdown_direction) + 4) + "');\n";
  } else {
    var code = "global.theDrone.box('149:" + dropdown_direction + "');\n";
  }

  return code;
};

Blockly.JavaScript['delay_time'] = function(block) {
  var value_second = Blockly.JavaScript.valueToCode(block, 'SECOND', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_delay = Blockly.JavaScript.statementToCode(block, 'DELAY');
  // TODO: Assemble JavaScript into code variable.
  var code = "\
setTimeout(function(){"+statements_delay+"},"+Number(value_second*1000)+"+delay_add);\n\
delay_add += "+ Number(value_second*1000) +";\n";
  return code;
};

Blockly.JavaScript['redstone_repeater'] = function(block) {
  var dropdown_direction = block.getFieldValue('DIRECTION');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box('93:" + dropdown_direction + "');\n";
  return code;
};

Blockly.JavaScript['four_direction'] = function(block) {
  var dropdown_item = block.getFieldValue('ITEM');
  var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
  var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box('" + dropdown_item + ":" + dropdown_direction + "'," + value_width + ",1," + value_length + ");\n";
  return code;
};

Blockly.JavaScript['button_attached'] = function(block) {
  var dropdown_button_material = block.getFieldValue('BUTTON_MATERIAL');
  var dropdown_block_material = block.getFieldValue('BLOCK_MATERIAL');
  var dropdown_direction = block.getFieldValue('DIRECTION');

  // Case Button direction setData
  var button_setdata = "";
  switch (dropdown_direction) {
    case "WEST" :
    button_setdata = 1;
    break;
    case "EAST" :
    button_setdata = 2;      
    break;
    case "NORTH" :
    button_setdata = 3;
    break;
    case "SOUTH" :
    button_setdata = 4;
    break;
  }
  // TODO: Assemble JavaScript into code variable.
  var code = "\n\
var blockButton = global.theDrone.box('"+ dropdown_block_material +"').back(2);\n\
var blockLocation = new bkLocation(player.world, blockButton.x, blockButton.y, blockButton.z );\n\
blockLocation.getBlock().getRelative(bkBlockFace."+ dropdown_direction +").setType(bkMaterial."+ dropdown_button_material +");\n\
blockLocation.getBlock().getRelative(bkBlockFace."+ dropdown_direction +").setData("+ button_setdata +");\n";
  return code;
};

Blockly.JavaScript['door_drone'] = function(block) {
  var dropdown_material = block.getFieldValue('material');
  var dropdown_direction = block.getFieldValue('direction');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box('" + dropdown_material + ":" + dropdown_direction + "').up().box('64:9');\n";
  return code;
};

Blockly.JavaScript['flower_choice'] = function(block) {
  var dropdown_flowers = block.getFieldValue('FLOWERS');
  // TODO: Assemble JavaScript into code variable.
  var code = ""+dropdown_flowers+"";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

/*
 * 텔레포트 사용하기
 */
Blockly.JavaScript['teleport_command'] = function(block) { /* 텔레포트 함수 */
  var value_command = Blockly.JavaScript.valueToCode(block, 'command', Blockly.JavaScript.ORDER_ATOMIC);
  var webip = window.myIP;
  // TODO: Assemble JavaScript into code variable.
  var code = "command( '"+webip+value_command.replace(/'/g,"")+"', function ( parameters, player ) {\n\
  var bkLocation = org.bukkit.Location;\n\
  var x = parameters[0];\n\
  var y = parameters[1];\n\
  var z = parameters[2];\n\
  if(isNaN(Number(x)) || isNaN(Number(y)) || isNaN(Number(z))){\n\
    player.sendMessage('please input number.');\n\
  } else {\n\
    player.teleport(new bkLocation(player.world, x, y, z));\n\
  }\n\
});\n";
  return code;
};

Blockly.JavaScript['block_type_example'] = function(block) {
  var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_material = block.getFieldValue('MATERIAL');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.blocktype("+value_message+","+dropdown_material+");\n";
  return code;
};

Blockly.JavaScript['castle_example'] = function(block) {
  var value_length = Blockly.JavaScript.valueToCode(block, 'LENGTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.castle("+value_length+","+value_height+");\n";
  return code;
};

Blockly.JavaScript['house_example'] = function(block) {
  var dropdown_option = block.getFieldValue('OPTION');
  var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
if(!Boolean(value_number)){
  var code = "global.theDrone."+dropdown_option+"(0);\n";	
} else {
  var code = "global.theDrone."+dropdown_option+"("+value_number+");\n";
}
	
  return code;
};

Blockly.JavaScript['temple_example'] = function(block) {
  var value_length = Blockly.JavaScript.valueToCode(block, 'LENGTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.temple("+value_length+");\n";
  return code;
};

Blockly.JavaScript['maze_example'] = function(block) {
  var value_length = Blockly.JavaScript.valueToCode(block, 'LENGTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.maze("+value_length+","+value_width+");\n";
  return code;
};

Blockly.JavaScript['rainbow_example'] = function(block) {
  var value_radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_number_colors = block.getFieldValue('NUMBER_COLORS');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.rainbow("+value_radius+");\n";
  return code;
};

Blockly.JavaScript['garden_example'] = function(block) {
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_length = Blockly.JavaScript.valueToCode(block, 'LENGTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.garden("+value_width+","+value_length+");\n";
  return code;
};

Blockly.JavaScript['firework'] = function(block) {
  var dropdown_color = block.getFieldValue('COLOR');
  var dropdown_type = block.getFieldValue('TYPE');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.firework("+dropdown_color+","+dropdown_type+");\n";
  return code;
};

Blockly.JavaScript['chessboard_example'] = function(block) {
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_depth = Blockly.JavaScript.valueToCode(block, 'DEPTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.chessboard(undefined,undefined,"+value_width+","+value_depth+");\n";
  return code;
};


/*
 * 터널
 */
Blockly.JavaScript['block_info'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.getLocation().getBlock().getType()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['block_entity'] = function(block) {
  var dropdown_material = block.getFieldValue('MATERIAL');
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+dropdown_material+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['stripes'] = function(block) {
  var value_lists = Blockly.JavaScript.valueToCode(block, 'LISTS', Blockly.JavaScript.ORDER_ATOMIC);
  var value_width = Blockly.JavaScript.valueToCode(block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC);
  var value_depth = Blockly.JavaScript.valueToCode(block, 'DEPTH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.boxa("+value_lists+","+value_width+",1,"+value_depth+");\n";
  return code;
};

Blockly.JavaScript['block_number'] = function(block) {
  var dropdown_blocks = block.getFieldValue('BLOCKS');
  var value_direction = Blockly.JavaScript.valueToCode(block, 'DIRECTION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+dropdown_blocks+":"+value_direction+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * 목장
 */
Blockly.JavaScript['event_playerentity'] = function(block) { /*개체와 상호작용하는 이벤트함수*/
  var statements_entity = Blockly.JavaScript.statementToCode(block, 'ENTITY');
  // TODO: Assemble JavaScript into code variable.
  var code = "events.on( org.bukkit.event.player.PlayerInteractEntityEvent , function( evt, cancel ) {\n " +statements_entity+ "\n});\n";
  return code;
};

Blockly.JavaScript['entity_rightclick'] = function(block) {  /*우클릭했을때 (개체 상호작용 이벤트함수 종속)*/
  // TODO: Assemble JavaScript into code variable.
   var code = "evt.getRightClicked()"
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['dye_color'] = function(block) { /*양 염색 색깔*/
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC);
  //value_color = value_color.replace(/[{()}]/g, '').replace(/['"]+/g, '');
  // TODO: Assemble JavaScript into code variable.
  var code = value_entity+".setColor"+value_color+";\n";
  return code;
};


Blockly.JavaScript['colors_var'] = function(block) { /*색깔*/
  var dropdown_color = block.getFieldValue('COLOR');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_color;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['event_entitydeath'] = function(block) { /*개체가 죽었을때 이벤트함수*/
  var statements_death = Blockly.JavaScript.statementToCode(block, 'DEATH');
  // TODO: Assemble JavaScript into code variable.
  var code = "events.on( org.bukkit.event.entity.EntityDeathEvent , function( evt, cancel ) {\n\
   if (evt.getEntity().getKiller() != null) {\n\
"+statements_death+"\n\
    }\n\
});\n";
  return code;
};

Blockly.JavaScript['item_drop'] = function(block) {  /*아이템 드랍*/
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  //value_location = value_location.slice(1,-1);
  var dropdown_items = block.getFieldValue('ITEMS');
  var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "var bkItemStack = Packages.org.bukkit.inventory.ItemStack;\nvar bkMaterial = Packages.org.bukkit.Material;\nvar playermeat = new bkItemStack( bkMaterial."+dropdown_items+", "+value_number+", undefined);\n\
"+value_location+".getLocation().getWorld().dropItem("+value_location+".getLocation(), playermeat);\n\
";
  return code;
};

Blockly.JavaScript['death_entity'] = function(block) { /*죽은 개체 변수*/
  // TODO: Assemble JavaScript into code variable.
  var code = "evt.getEntity()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['kill_entity'] = function(block) {  /*개체를 죽인 개체 변수 (나 자신을 나타냄)*/
  // TODO: Assemble JavaScript into code variable.
  var code = "evt.getEntity().getKiller()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['death_explosion'] = function(block) { /*죽었을때 폭발*/
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_power = Blockly.JavaScript.valueToCode(block, 'POWER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "if("+value_power+" < 1 || "+value_power+" > 100) { player.chat('위력에 들어간 값이 1이상 100이상을 벗어났습니다.'); }\nelse{ "+value_location+".getLocation().getWorld().createExplosion("+value_location+".getLocation(), "+value_power+");\n}\n";
  return code;
};

Blockly.JavaScript['animal_var'] = function(block) { /*동물변수(조건문에서 쓰임)*/
  var dropdown_animals = block.getFieldValue('ANIMALS');
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+dropdown_animals+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['entity_getlocation'] = function(block) { /*개체 위치 변수블록*/
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_entity+".getLocation()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['entity_onground'] = function(block) {  /*개체가 땅에 있는지 변수블록*/
  var value_entity = Blockly.JavaScript.valueToCode(block, 'ENTITY', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_entity+".isOnGround()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


/*
 * 트램폴린
 */
Blockly.JavaScript['event_playerinteract'] = function(block) { /*사용자가 상호작용하는 이벤트*/
  var statements_interact = Blockly.JavaScript.statementToCode(block, 'INTERACT');
  // TODO: Assemble JavaScript into code variable.
  var code = "events.on( org.bukkit.event.player.PlayerInteractEvent , function( evt, cancel ) {\n\
   "+statements_interact+"\n\
});\n";
  return code;
};

Blockly.JavaScript['timer_countup_start'] = function(block) { /*시간측정을 시작할때 사용*/
  // TODO: Assemble JavaScript into code variable.
  var code = "global.countTime = 0;\nglobal.timeInterval = setInterval(function(){\n\
    global.countTime++;\n\
  }, 1000);\n";
  return code;
};

Blockly.JavaScript['timer_countup_stop'] = function(block) { /*시간측정 멈춤*/
  // TODO: Assemble JavaScript into code variable.
  var code = "clearInterval(global.timeInterval);\n";
  return code;
};

Blockly.JavaScript['block_click_var'] = function(block) { /*오른쪽 클릭한 블록*/
  // TODO: Assemble JavaScript into code variable.
  var code = "evt.getClickedBlock()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['blockvar_ore'] = function(block) {  /*광석 변수 (오른쪽 클릭 이벤트에서 사용)*/
  var dropdown_blocks = block.getFieldValue('BLOCKS');
  // TODO: Assemble JavaScript into code variable.
  var code = "'"+dropdown_blocks+"'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['clickblock_type'] = function(block) {  /*오른쪽 클릭한 블록의 종류를 알아내는 블록*/
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  //var code = value_name+".getType().toString().toLowerCase().replace(\"_\", \"\")";
  var code = value_name+".getType().toString()";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['block_change_click'] = function(block) {  /*클릭한 블록을 원하는 블록으로 변경*/
  var value_before = Blockly.JavaScript.valueToCode(block, 'BEFORE', Blockly.JavaScript.ORDER_ATOMIC);
  var value_after = Blockly.JavaScript.valueToCode(block, 'AFTER', Blockly.JavaScript.ORDER_ATOMIC);
  value_after = value_after.replace(/'/g,"");
  // TODO: Assemble JavaScript into code variable.
  var code = "var bkMaterial = Packages.org.bukkit.Material;\n"+value_before+".setType(bkMaterial."+value_after+");\n";
  return code;
};

Blockly.JavaScript['measure_time'] = function(block) {  /*측정된 시간 출력 변수*/
  // TODO: Assemble JavaScript into code variable.
  var code = "global.countTime+'초'";
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * 딕셔너리(Mutator)
 */
Blockly.JavaScript['dict_get'] = function(block) {  
  var dict = Blockly.JavaScript.valueToCode(block, 'DICT',
      Blockly.JavaScript.ORDER_MEMBER) || '{}';
  var value = Blockly.JavaScript.valueToCode(block, 'ITEM',
      Blockly.JavaScript.ORDER_NONE) || 'None';
  var code = dict + '[' + value + ']';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['dicts_create_with'] = function(block) {
  var value_keys = Blockly.JavaScript.valueToCode(block, 'keys', Blockly.JavaScript.ORDER_ATOMIC);
  var code = new Array(block.itemCount_);

  for (var n = 0; n < block.itemCount_; n++) {
    var key = Blockly.JavaScript.valueToCode(block, 'KEY' + n,
        Blockly.JavaScript.ORDER_NONE) || 'None';
    var value = Blockly.JavaScript.valueToCode(block, 'VALUE' + n,
        Blockly.JavaScript.ORDER_NONE) || 'None';
    code[n] = key +": "+ value;
  }
  code = '{' + code.join(',\n\t') + '}';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * 레시피
 */
Blockly.JavaScript['monster_spawn'] = function(block) {
  var dropdown_monsters = block.getFieldValue('MONSTERS');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType."+dropdown_monsters+");\n";
  return code;
};

Blockly.JavaScript['recipe_key'] = function(block) { /*레시피 딕셔너리 키 블록*/
  var dropdown_key = block.getFieldValue('KEY');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_key;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['recipe_value'] = function(block) { /*레시피 딕셔너리 값 블록*/
  var dropdown_value = block.getFieldValue('VALUE');
  var dropdown_items = block.getFieldValue('ITEMS');
  var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_alphabet = block.getFieldValue('ALPHABET');

  var dropdown_option1 = block.getFieldValue('OPTION1');
  var dropdown_option2 = block.getFieldValue('OPTION2');
  var dropdown_option3 = block.getFieldValue('OPTION3');
  var dropdown_option4 = block.getFieldValue('OPTION4');
  var dropdown_option5 = block.getFieldValue('OPTION5');
  var dropdown_option6 = block.getFieldValue('OPTION6');
  var dropdown_option7 = block.getFieldValue('OPTION7');
  var dropdown_option8 = block.getFieldValue('OPTION8');
  var dropdown_option9 = block.getFieldValue('OPTION9');
	
  // TODO: Assemble JavaScript into code variable.

  if(!Boolean(value_number)){
    var code = "['"+dropdown_option1+dropdown_option2+dropdown_option3+"','"+dropdown_option4+dropdown_option5+dropdown_option6+"','"+dropdown_option7+dropdown_option8+dropdown_option9+"']";
  } else if (dropdown_alphabet == 0) {
    var code = dropdown_items+"("+value_number+")";
  } else{ 
    var code = "{"+dropdown_alphabet+": "+dropdown_items+"("+value_number+")}";
  }

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['recipe_add'] = function(block) { /*레시피에 만든 딕셔너리 변수를 추가*/ 

  var value_recipe_add = Blockly.JavaScript.valueToCode(block, 'RECIPE_ADD', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "var recipes = require('recipes');\nrecipes.add("+value_recipe_add+");\n";
  return code;

}

Blockly.JavaScript['module_import'] = function(block) {  /*모듈 불러오기 블록*/
  var dropdown_module = block.getFieldValue('MODULE');
  // TODO: Assemble JavaScript into code variable.
  switch (dropdown_module) {
    case "ITEMS":
      var code = "var items = require('items');\n";
      break;
    case "RECIPES":
      var code = "var recipes = require('recipes');\n";
      break;
    case "SCOREBOARD":
      var code = "function execCommand( command ){\n  server.dispatchCommand(player, command);\n}\n";
      break;
  }
  return code;
};

Blockly.JavaScript['scoreboard_totalkillcount'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = "execCommand('scoreboard objectives add " + text_name + " totalKillCount "+ text_name +"');\n\
execCommand('scoreboard objectives setdisplay sidebar " + text_name +"');\n\
";
  return code;
};

Blockly.JavaScript['scoreboard_reset'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = "execCommand('scoreboard players reset '+ player +' "+ text_name +"');\n";
  return code;
};

Blockly.JavaScript['scoreboard_remove'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = "execCommand('scoreboard objectives remove " + text_name +"');\n";
  return code;
};


/*
 * 대규모 밀밭 만들기
 */
Blockly.JavaScript['farmland_material'] = function (block) { /* 밀밭 만들기 재료 */
    var dropdown_material = block.getFieldValue('material');
    var code = "global.theDrone." + 'box(' + dropdown_material + ');\n';
    return code;
};

/*
 * 롤러코스터 만들기
 */
Blockly.JavaScript['rail_material'] = function (block) { /* 롤러코스터 재료 */
    var dropdown_material = block.getFieldValue('material');
    var code = "global.theDrone." + 'box(' + dropdown_material + ');\n';
    return code;
};

/*
 * 울타리 만들기
 */
Blockly.JavaScript['fence_material'] = function (block) { /* 울타리 재료 */
    var dropdown_material = block.getFieldValue('material');
    var code = "global.theDrone." + 'box(' + dropdown_material + ');\n';
    return code;
};

/*
 * 요새 만들기
 */
Blockly.JavaScript['castle_material'] = function (block) { /* 요새 재료 */
    var dropdown_material = block.getFieldValue('material');
    var code = "global.theDrone." + 'box(' + dropdown_material + ');\n';
    return code;
};

Blockly.JavaScript['castle_rectangle'] = function (block) { /* 요새 직사각형 재료 */
    var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
    var value_length = Blockly.JavaScript.valueToCode(block, 'length', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_material = block.getFieldValue('material');
    var dropdown_fill = block.getFieldValue('fill');
    var code = "global.theDrone.box" + dropdown_fill + "(" + JSON.stringify(dropdown_material).replace(/"/g,"").replace(".",":") + "," + value_width + ",1," + value_length + ");\n";

    return code;
};

/*
 * 주크박스 만들기
 */
Blockly.JavaScript['jukebox_material'] = function (block) { /* 주크박스 재료 */
    var dropdown_material = block.getFieldValue('material');
    var code = "global.theDrone." + 'box(' + dropdown_material + ');\n';
    return code;
};

Blockly.JavaScript['repeater'] = function(block) { /* 레드스톤 중계기 */
  var dropdown_delay = block.getFieldValue('delay');
  // TODO: Assemble JavaScript into code variable.
  var code = "global.theDrone.box('93:'+((global.theDrone.dir+1)%4+"+Number(4*(dropdown_delay-1))+"));\n";
  return code;
};

Blockly.JavaScript['note_material'] = function(block) { /* 소리 블록 */
  var value_note = Blockly.JavaScript.valueToCode(block, 'note', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = "\
if("+value_note+"==25){\n\
  global.theDrone.box('1');\n\
} else {\n\
  var block = global.theDrone.getLocation().getBlock();\n\
  block.setTypeId(25);\n\
  var state = block.getState();\n\
  state.setRawNote(" + value_note + ");\n\
  state.update();\n\
}\n\
";
  
  return code;
};

Blockly.JavaScript['note'] = function(block) { /* 음 높이 */
  var dropdown_note = block.getFieldValue('note');
  // TODO: Assemble JavaScript into code variable.
  var code = dropdown_note;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * 리스트
 */
Blockly.JavaScript['list_getindex'] = function(block) { /* 리스트 위치 값 반환 */
  var list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_ATOMIC);
  var at = Blockly.JavaScript.getAdjusted(block, 'AT');
  // TODO: Assemble JavaScript into code variable.
  var code = list + '[' + at + ']';
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['list_setindex'] = function(block) { /* 리스트 위치 값 저장 */
  var list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_ATOMIC);
  var at = Blockly.JavaScript.getAdjusted(block, 'AT');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  return list + '[' + at + '] = ' + value + ';\n';
};

/*
 * 문자열
 */
Blockly.JavaScript['string_charAt'] = function(block) { /* 문자 얻기 */
  var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var at = Blockly.JavaScript.getAdjusted(block, 'AT');
  // Adjust index if using one-based indices.
  var code = value_text + '.charAt(' + at + ')';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['string_substring'] = function(block) { /* 문자열 잘라내기 */
  var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var at1 = Blockly.JavaScript.getAdjusted(block, 'AT1');
  var at2 = Blockly.JavaScript.getAdjusted(block, 'AT2', 1);
  // TODO: Assemble JavaScript into code variable.
  code = value_text + '.slice(' + at1 + ', ' + at2 + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};