// 등록비용 계산
function calculatorCost(){
	var $obj = $("#estmBody .estmCell[estmNo='"+estmNow+"']");
	if(estmRslt.optionExtra && estmRslt.taxFreeEtc.indexOf("O")<0 ) estmRslt.vehicleVat -= estmRslt.optionExtra;	// 별도 옵션 포함 없으면 제외
	estmRslt.taxBase = number_cut( estmRslt.vehicleVat / 1.1 , 1, "floor");	// 과세표준, 부가세 제외
	
	// 취득세율
	if(estmCfg.usage == "P" && estmCfg.division=="P"){	// 가. 비영업용 승용자동차
		estmRslt.takeRate = 7;	
		if(estmCfg.extra.indexOf("0")>=0) estmRslt.takeRate = 4;	// 경자동차 (전기차 배기량 없음 처리)
	}else if(estmCfg.usage == "P"){	// 나. 1) 비영업용
		estmRslt.takeRate = 5;	
		if(estmCfg.extra.indexOf("0")>=0) estmRslt.takeRate = 4;	// 경자동차
	}else if(estmCfg.usage == "C"){	// 나. 2) 영업용
		estmRslt.takeRate = 4;
		if(estmCfg.takeFree=="T") estmRslt.takeRate = 2.4;	// 택시 대차
	}else{	// 다. 가목 및 나목 외의 차량
		estmRslt.takeRate = 2;
	}
	estmRslt.takeTax = number_cut(estmRslt.takeRate * estmRslt.taxBase / 100 , 10, "floor");	// 취득세액
	
	// 장애인 면제 대상 차량
	if(estmCfg.extra.indexOf("C")>=0) estmCfg.freeD = false; // 캠핑카 제외
	else if(estmCfg.division=="P" && estmCfg.displace<2000) estmCfg.freeD = true;	// 가. 배기량 2천시시 이하인 승용자동차
	else if(estmCfg.division=="P" && estmCfg.person>=7 && estmCfg.person<=10) estmCfg.freeD = true;	// 나. 승차 정원 7명 이상 10명 이하인 대통령령으로 정하는 승용자동차
	else if(estmCfg.division=="B" && estmCfg.person<=15) estmCfg.freeD = true;	// 2. 승차 정원 15명 이하인 승합자동차
	else if(estmCfg.division=="T" && estmCfg.carry<=1000) estmCfg.freeD = true;	// 3. 최대적재량 1톤 이하인 화물자동차
	else  estmCfg.freeD = false;
	
	// 다자녀 양육자 감면 대상 차량
	if(estmCfg.extra.indexOf("C")>=0) estmCfg.freeC = false;	// 캠핑카 제외
	else if(estmCfg.division=="P" && estmCfg.person>=7 && estmCfg.person<=10) estmCfg.freeC = true;	// 가. 승차정원이 7명 이상 10명 이하인 승용자동차
	else if(estmCfg.division=="P") estmCfg.freeC = true;	// 나. 가목 외의 승용자동차	(한도 140만원)
	else if(estmCfg.division=="B" && estmCfg.person<=15) estmCfg.freeC = true;	// 2. 승차 정원 15명 이하인 승합자동차
	else if(estmCfg.division=="T" && estmCfg.carry<=1000) estmCfg.freeC = true;	// 3. 최대적재량 1톤 이하인 화물자동차
	else  estmCfg.freeC = false;
	estmRslt.takeFree = "";
	estmRslt.takeFreeName = "";
	if(estmCfg.takeFree=="D" && estmCfg.freeD){	// 장애인
		estmRslt.takeTax = 0;
		estmRslt.takeFree = "D";
		estmRslt.takeFreeName = "장애인 면제";
	}else if(estmRslt.taxFreeEtc.indexOf("V")>=0 && estmCfg.freeC){	// 다자녀
		if(estmCfg.division=="P" && estmCfg.person<7 && estmRslt.takeTax>1400000){	// 7인 이하 승용 140만원 한도
			estmRslt.takeTax = estmRslt.takeTax - 1400000;
		}else if(estmRslt.takeTax>2000000){
			estmRslt.takeTax = estmRslt.takeTax - number_cut(estmRslt.takeTax * 0.85 , 10, "floor");	// 85% 만 감면...
		}else{
			estmRslt.takeTax = 0;
		}
		estmRslt.takeFree = "C";
		estmRslt.takeFreeName = "다자녀 감면";
	}else if(estmCfg.extra.indexOf("H")>=0 || estmCfg.extra.indexOf("h")>=0 || estmCfg.extra.indexOf("P")>=0 || estmCfg.extra.indexOf("p")>=0){	
		if(estmRslt.takeTax>900000){
			estmRslt.takeTax = estmRslt.takeTax - 900000;
		}else{
			estmRslt.takeTax = 0;
		}
		estmRslt.takeFree = "H";
		estmRslt.takeFreeName = "하이브리드 감면";
	}else if(estmCfg.extra.indexOf("E")>=0 || estmCfg.extra.indexOf("e")>=0 || estmCfg.extra.indexOf("F")>=0 || estmCfg.extra.indexOf("f")>=0){	
		if(estmRslt.takeTax>1400000){
			estmRslt.takeTax = estmRslt.takeTax - 1400000;
		}else{
			estmRslt.takeTax = 0;
		}
		if(estmCfg.extra.indexOf("E")>=0 || estmCfg.extra.indexOf("e")>=0){
			estmRslt.takeFree = "E";
			estmRslt.takeFreeName = "전기차 감면";
		}else{
			estmRslt.takeFree = "F";
			estmRslt.takeFreeName = "수소차 감면";
		}
	}else if(estmCfg.usage=="P" && estmCfg.extra.indexOf("0")>=0){	 // 경차	비영업용 승용자동차로 취득하는 경우에는 취득세를 2021년 12월 31일까지 면제한다.
		if(estmRslt.takeTax>500000){
			estmRslt.takeTax = estmRslt.takeTax - 500000;
		}else{
			estmRslt.takeTax = 0;
		}
		estmRslt.takeFree = "M";
		estmRslt.takeFreeName = "경차 감면";
	}
	
	// 채권
	bond = calculatorBond(estmRslt.takeSido, estmCfg.usage, estmCfg.displace, estmCfg.carry, estmCfg.person, estmCfg.extra, estmCfg.division, estmRslt.taxBase);
	//console.log(bond);
	estmRslt.bondRate = bond[0];
	estmRslt.bondBuy = bond[1];
	estmRslt.bondKind = bond[2];
	estmRslt.bondYear = bond[3];
	estmRslt.bondFreeName = "";
	if(estmCfg.bondFree=="D" && estmCfg.extra.indexOf("C")<0){	// 장애인 감면, 캠핑카 제외
		estmRslt.bondBuy = 0;
		estmRslt.bondFree = "D";
		estmRslt.bondFreeName = "장애인 면제";
	}else if(estmCfg.extra.indexOf("E")>=0 || estmCfg.extra.indexOf("e")>=0 || estmCfg.extra.indexOf("F")>=0 || estmCfg.extra.indexOf("f")>=0 || estmCfg.extra.indexOf("H")>=0 || estmCfg.extra.indexOf("h")>=0 || estmCfg.extra.indexOf("P")>=0 || estmCfg.extra.indexOf("p")>=0){	// Hev/전기자동차 감면
		if(estmRslt.bondKind == "subway"){	
			if((estmCfg.extra.indexOf("E")>=0 || estmCfg.extra.indexOf("e")>=0 || estmCfg.extra.indexOf("F")>=0 || estmCfg.extra.indexOf("f")>=0) && estmRslt.bondBuy>2500000){	// 도시철도 전기/수소 250만원 한도
				estmRslt.bondBuy = estmRslt.bondBuy - 2500000;
			}else if((estmCfg.extra.indexOf("H")>=0 || estmCfg.extra.indexOf("h")>=0 || estmCfg.extra.indexOf("P")>=0 || estmCfg.extra.indexOf("p")>=0) && estmRslt.bondBuy>2000000){	// 도시철도 하이브리드 250만원 한도
				estmRslt.bondBuy = estmRslt.bondBuy - 2000000;
			}else{
				estmRslt.bondBuy = 0;
			}
		}else{	// 지역개발 150만원
			if(estmRslt.bondBuy>1500000){
				estmRslt.bondBuy = estmRslt.bondBuy - 1500000;
			}else{
				estmRslt.bondBuy = 0;
			}
		}
	}
	if(estmRslt.bondYear==7) estmRslt.bondCut = parseFloat($("#bondCut7").val());	// 서울 7년 할인율
	else estmRslt.bondCut = parseFloat($("#bondCut5").val());	// 지방 5년 할인율 
	estmRslt.bondBS = "S";
	if(typeof(estmConfig[estmNow]['bondCut'])!="undefined"){
		var val = estmConfig[estmNow]['bondCut'].split("\t");
		estmRslt.bondBS = val[0];
		if(typeof(val[1])!="undefined" && val[1]){
			estmRslt.bondCut = parseFloat(val[1]);
		}
	}
	estmRslt.bondSale = number_cut(estmRslt.bondBuy * estmRslt.bondCut / 100, 1, "floor");
	// 부대비용
	if(typeof(estmConfig[estmNow]['takeExtra'])!="undefined" && estmConfig[estmNow]['takeExtra']) estmRslt.takeExtra = parseInt(estmConfig[estmNow]['takeExtra']);
	else estmRslt.takeExtra = parseInt($("#takeExtra").val());
	// 의무보험료
	if(typeof(estmConfig[estmNow]['insureD'])!="undefined" && estmConfig[estmNow]['insureD']) estmRslt.deliveryInsure = parseInt(estmConfig[estmNow]['insureD']);
	else{
		if(estmCfg.division=="T") estmRslt.deliveryInsure = calculatorDeliveryInsure(estmCfg.division,estmCfg.carry,estmRslt.brand);
		else estmRslt.deliveryInsure = calculatorDeliveryInsure(estmCfg.division,estmCfg.person,estmRslt.brand);
	}
	// 합계
	estmRslt.takeSum = estmRslt.takeTax + estmRslt.takeExtra + estmRslt.deliveryInsure;
	if(estmRslt.deliveryCal == "T") estmRslt.takeSum +=  estmRslt.deliveryCost;
	if(estmRslt.bondBS == "S") estmRslt.takeSum += estmRslt.bondSale;
	else  estmRslt.takeSum += estmRslt.bondBuy;
	if(typeof(estmRslt.takeInspect)!="undefined") estmRslt.takeSum += estmRslt.takeInspect;	// 구조변경 비용

	// 연간 자동차세
	if(estmCfg.takeFree=="D" && estmCfg.freeD){
		estmRslt.carTaxY = 0;
		estmRslt.carTaxM = "장애인 면제";
	}else{
		if(estmCfg.usage=="P") estmRslt.carTaxM = "비영업용";
		else estmRslt.carTaxM = "영업용";
		if(estmCfg.division=="P"){
			var valTax = estmCfg.displace;
			 estmRslt.carTaxM += " / 승용 / ";
			if(estmCfg.displace) estmRslt.carTaxM += "배기량 "+number_format(estmCfg.displace)+"cc";
			else  estmRslt.carTaxM += "전기차";
		}else if(estmCfg.division=="B"){
			var valTax = 1;
			estmRslt.carTaxM += " / 승합 / 소형일반버스";
		}else if(estmCfg.division=="T"){
			var valTax = estmCfg.carry;
			estmRslt.carTaxM += " / 화물 / 적재량 "+number_format(estmCfg.displace)+"kg";
		}
		var carTax = calculatorCarTaxY(estmCfg.division,estmCfg.usage,valTax);
		estmRslt.carTaxY = carTax[1];
	}
}

function calculatorBond(takeSido,usage,displace,carry,person,extra,division,taxBase){
	// usage : 비사업용 P, 사업용 C 
	// division : 승용P, 승합B, 화물T
	var rate = 0;
	var buy = 0;
	var kind = "local";	// 지역개발채권 local, 도시철도 subway
	var year = 5;
	if(takeSido == "SU") year = 7;
	
	if(takeSido == "SU" || takeSido == "BS"  || takeSido == "DG"){	// 도시철도법 시행령, 서울, 부산 대구
		var kind = "subway";
		if(usage == "P" && division =="P" && person <7 ){		// 가. 비사업용 승용자동차  ( 7인 이상 제외) 
			if(extra.indexOf("E")>=0 || extra.indexOf("e")>=0 || extra.indexOf("F")>=0 || extra.indexOf("f")>=0){		// 전기자동차
				if(extra.indexOf("1")>=0)  rate = 9;	// 소형
				else if(extra.indexOf("2")>=0)  rate = 12;	// 중형
				else if(extra.indexOf("3")>=0)  rate = 20;	// 대형
				else rate = 12;	// 중형
			}else{	// 내연기관, 1000cc 미만 면제
				if(displace>=1000 && displace<1600 && extra.indexOf("1")>=0) rate = 9;	// 소형 사이즈
				else if(displace>=1000 && displace<1600) rate = 12;	// 중형 사이즈
				else if(displace>=1600 && displace<2000) rate = 12;	// 중형
				else if(displace>=2000) rate = 20;	// 대형
				if(extra.indexOf("M")>=0)  rate = 5;	// 다목적형
				if(takeSido == "BS" || takeSido == "DG"){		// 부산 채권 조례 예외 제3조(도시철도채권의 매입대상 및 금액), 대구 부산과 동일
					if(displace>=1000 && displace<2000) rate = 4;	// 소형/중형 4, 
					else if(displace>=2000) rate = 5;	// 대형 5 
					if(extra.indexOf("M")>=0)  rate = 4;	// 다목적형 4
				}
			}
		}else if(usage == "C" && division =="P" && (extra.indexOf("M")<0 && person <7)){	// 나. 사업용 승용자동차 (다목적, 7인 이하 제외)
			rate = 3;
		}else if(usage == "C"  && division =="P" && extra.indexOf("M")>=0){	// 다. 사업용 다목적형
			rate = 2;
		}else if((division =="P" && person >=7) || division =="B"){	// 라. 7인 이상 승용자동차, 승합자동차
			if(division =="P" || (division =="B" && person >= 11 && person <= 15 && extra.indexOf("1")>=0)){	// 승용차, 승합 11~15인승
				if(usage == "P") rate = 390000;	// 비사업용
				else if(usage == "C") rate = 130000;	// 사업용
			}else if(division =="B" && person >= 11 && person <= 35 ){	// 승합 16~35인승
				if(usage == "P") rate = 650000;	// 비사업용
				else if(usage == "C") rate = 215000;	// 사업용
			}else if(division =="B" && person >= 36 ){	// 승합 36인승 이상
				if(usage == "P") rate = 1300000;	// 비사업용
				else if(usage == "C") rate = 435000;	// 사업용
			}
		}else if(division =="T"){	// 마. 화물자동차
			if(carry<=1000){	// 1톤 이하
				if(usage == "P") rate = 195000;	// 비사업용
				else if(usage == "C") rate = 65000;	// 사업용
			}else if(carry>1000 && carry<5000){	// 1톤 초과, 5톤 미만
				if(usage == "P") rate = 390000;	// 비사업용
				else if(usage == "C") rate = 130000;	// 사업용
			}else if(carry>=5000){	// 5톤 이상
				if(usage == "P") rate = 650000;	// 비사업용
				else if(usage == "C") rate = 215000;	// 사업용
			}
		}
		
		if(takeSido == "DG" || takeSido == "BS"){ // 대구/부산 예외 자동차 신규등록(비사업용 승용자동차 대형 제외) 2020년 12월 31일까지 매입을 면제한다.
			if(usage == "P" && division =="P" && displace>=2000 && person<7 && extra.indexOf("M")<0 ){		// 대형 제외
				
			}else{
				rate = 0;
			}
		}
		
	}else if(takeSido == "KG"){	// 경기
		if(extra.indexOf("C")>=0 && taxBase>=50000000) division = "P"; // 캠핑카 5000만원 넘으면 승용기준 Mtops 와 맞춤
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<=1600) rate = 6;	// 소형
			else if(displace>=1600 && displace<2000) rate = 8;	// 중형
			else if(displace>=2000) rate = 12;	// 대형
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 승합자동차
			if(carry<=1000) rate = 1.5;		// 1톤 이하
			else if(carry>1000) rate = 3;		// 1톤 초과
		}else if(usage == "C" && division =="P"){		// 라. 영업용 승용자동차
			if(displace>=1000) rate = 2;		// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 영업용 승합자동차
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T"){		// 바. 영업용 승합자동차
			if(carry<=1000) rate = 0.5;		// 1톤 이하
			else if(carry>1000) rate = 1;		// 1톤 초과
		}
		if(usage == "P" && division =="P" && taxBase>=50000000){	// 5000만원 이상 제외
			
		}else if(usage == "P" && division =="P" && displace>=2000){	// 2,000cc초과 비영업용 승용자동차 50% 감면
			rate = rate / 2;
		}else{
			rate = 0;
		}
		 
	}else if(takeSido == "IC"){	// 인천, 도시철도/지역개발 별도 운영
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1500 && displace<2000) rate = 4;	// 1500cc 이상
			else if(displace>=2000){	// 2000cc 이상 다목적
				rate = 5;
				if(extra.indexOf("M")>=0) rate = 4;	// 2000cc 이상 다목적
			}
			if(person>=7) rate = 390000;	// 7인승
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(person>=11) rate = 1.5;		// 11인승 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 화물자동차
			if(displace>=1000) rate = 1.5;		// 1000cc 이상
		}
		if(usage == "P" && division =="P" &&  displace>=2000 && extra.indexOf("M")<0){	
			// 인천 광역시 일시 면제
		}else{
			rate = 0;	
		}
	}else if(takeSido == "KW"){	// 강원 
		if(usage == "P" && division =="P"){		// 가. 비사업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비사업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비사업용 화물자동차 1000cc이상
			if(carry<600) rate = 1.5;		// 0.6톤 미만
			else if(carry>=600) rate = 3;		// 0.6톤 미만
		}else if(usage == "C" && division =="P"){		// 라. 사업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 사업용 승합자동차  1000cc 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T" && displace>=1000){		// 바. 사업용 화물자동차 1000cc이상
			if(carry<600) rate = 0.5;		// 0.6톤 미만
			else if(carry>=600) rate = 1;		// 0.6톤 미만
		}
	}else if(takeSido == "DJ"){	// 대전
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 4;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 4;	// 1600cc 이상
			else if(displace>=2000) rate = 5;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(displace>=1000) rate = 1.5;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 화물자동차
			if(displace>=1000) rate = 1.5;		// 1000cc 이상
		}
	}else if(takeSido == "SJ"){	// 세종 
		if(usage == "P" && division =="P"){		// 가. 비사업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비사업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비사업용 화물자동차 1000cc이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "C" && division =="P"){		// 라. 사업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 사업용 승합자동차  1000displace 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T"){		// 바. 사업용 화물자동차 1000cc이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}
	}else if(takeSido == "CB"){	// 충북 
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(person>=11) rate = 3;		// 11인승 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비영업용 화물자동차 
			if(carry>=1000) rate = 3;		// 1톤 이상
		}else if(usage == "C" && division =="P"){		// 라. 사업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 사업용 승합자동차 
			if(person>=11) rate = 1;		// 11인승 이상
		}else if(usage == "C" && division =="T" && displace>=1000){		// 바. 사업용 화물자동차
			if(carry>=1000) rate = 1;		// 1톤 이상
		}
	}else if(takeSido == "CN"){	// 충남
		if(usage == "P" && division =="P"){		// 가. 비사업용 승용자동차
			if(displace>=1000 && displace<2000) rate = 4;	// 1000cc  이상
			else if(displace>=2000) rate = 5;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비사업용 승합자동차
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비사업용 화물자동차
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}
	}else if(takeSido == "US"){	// 울산 
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 화물자동차
			if(carry<600) rate = 1.5;		// 0.6톤 미만
			else if(carry>=600) rate = 3;		// 0.6톤 미만
		}else if(usage == "C" && division =="P"){		// 라. 영업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 영업용 승합자동차  1000cc 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T"){		// 바. 영업용 화물자동차
			if(carry<600) rate = 0.5;		// 0.6톤 미만
			else if(carry>=600) rate = 1;		// 0.6톤 미만
		}
	}else if(takeSido == "GB"){	// 경북  
		if(usage == "P" && division =="P"){		// 가. 비사업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비사업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비사업용 화물자동차 1000cc이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "C" && division =="P"){		// 라. 사업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 사업용 승합자동차  1000cc 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T"){		// 바. 사업용 화물자동차 1000cc이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}
	}else if(takeSido == "GN" || takeSido == "CW"){	// 경남, 창원
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1500 && displace<2000) rate = 4;	// 1500cc 이상
			else if(displace>=2000){ // 2000cc 이상
				rate = 5;	
				if(extra.indexOf("M")>=0) rate = 4;	// 2000cc 이상 다목적
			}
			if(person>=7) rate = 390000;	// 7인승
			if(takeSido == "CW" && displace<2000) rate = 0;  // 창원시 지역개발기금 설치 조례 면제
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(person>=11) rate = 1.5;		// 11인승 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 화물자동차 
			if(carry>=600) rate = 1.5;		// 0.6톤 이상
		}
	}else if(takeSido == "KJ"){	// 광주 
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 4;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 4;	// 1600cc 이상
			else if(displace>=2000) rate = 5;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비영업용 화물자동차 1000cc이상
			if(carry<600) rate = 1.5;		// 0.6톤 미만
			else if(carry>=600) rate = 3;		// 0.6톤 미만
		}else if(usage == "C" && division =="P"){		// 라. 영업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 영업용 승합자동차  1000cc 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T" && displace>=1000){		// 바. 영업용 화물자동차 1000cc이상
			if(carry<600) rate = 0.5;		// 0.6톤 미만
			else if(carry>=600) rate = 1;		// 0.6톤 미만
		}
	}else if(takeSido == "JB"){	// 전북  
		if(usage == "P" && division =="P"){		// 가. 비사업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 4;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 6;	// 1600cc 이상
			else if(displace>=2000) rate = 10;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비사업용 승합자동차
			if(person>=11) rate = 1.5;		// 11인승 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비사업용 화물자동차 1000cc이상
			if(carry>=600) rate = 1.5;		// 0.6톤 이상
		}
	}else if(takeSido == "JN"){	// 전남 
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 6;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 8;	// 1600cc 이상
			else if(displace>=2000) rate = 12;	// 2000cc 이상
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차 1000cc 이상
			if(displace>=1000) rate = 3;		// 1000cc 이상
		}else if(usage == "P" && division =="T" && displace>=1000){		// 다. 비영업용 화물자동차 1000cc이상
			if(carry<600) rate = 1.5;		// 0.6톤 미만
			else if(carry>=600) rate = 3;		// 0.6톤 미만
		}else if(usage == "C" && division =="P"){		// 라. 영업용 승용자동차
			if(displace>=1000) rate = 2;	// 1000cc 이상
		}else if(usage == "C" && division =="B"){		// 마. 영업용 승합자동차  1000cc 이상
			if(displace>=1000) rate = 1;		// 1000cc 이상
		}else if(usage == "C" && division =="T" && displace>=1000){		// 바. 영업용 화물자동차 1000cc이상
			if(carry<600) rate = 0.5;		// 0.6톤 미만
			else if(carry>=600) rate = 1;		// 0.6톤 미만
		}
	}else if(takeSido == "JJ"){	// 제주
		if(usage == "P" && division =="P"){		// 가. 비영업용 승용자동차
			if(displace>=1000 && displace<1600) rate = 3;	// 1000cc 이상
			else if(displace>=1600 && displace<2000) rate = 4;	// 1600cc 이상
			else if(displace>=2000){	// 2000cc 이상 다목적
				 rate = 5;
				if(extra.indexOf("M")>=0) rate = 4;	// 2000cc 이상 다목적
			}
			if(person>=7) rate = 390000;	// 7인승
		}else if(usage == "P" && division =="B"){		// 나. 비영업용 승합자동차
			if(displace>=1000) rate = 1.5;		// 1000cc 이상
		}else if(usage == "P" && division =="T"){		// 다. 비영업용 화물자동차
			if(displace>=1000) rate = 1.5;		// 1000cc 이상
		}
	}
	
	if(rate>100) buy = rate;
	else if(rate){
		buy = rate / 100  *  taxBase / 5000 ;
		if(kind == "local") buy = number_cut(buy,1,"floor") * 5000;	// 지역개발 버림
		else buy = number_cut(buy,1,"round") * 5000;	// 도시철도 올림
	}
	return [ rate, buy, kind, year ];
}

function calculatorCarTaxY(kind,use,val){
	if(use=="P") use="G";
	else if(use=="C") use="O";
	var rate = 0;
	if(kind=="P" && use=="G"){	// 승용 비영업용
		if(val == 0) rate = 100000;
		else if(val <= 1000 ) rate = 80 * val;
		else if(val <= 1600 ) rate = 140 * val;
		else rate = 200 * val;
	}else if(kind=="P" && use=="O"){	// 승용 영업용
		if(val == 0) rate = 20000;
		else if(val <= 1600 ) rate = 18 * val;
		else if(val <= 2500 ) rate = 19 * val;
		else rate = 24 * val;
	}else if(kind=="B" && use=="G"){	// 승합 비영업용
		if(val == 1) rate = 65000;
		else if(val == 2 ) rate = 115000;
	}else if(kind=="B" && use=="O"){	// 승합 영업용
		if(val == 1) rate = 25000;
		else if(val == 2 ) rate = 42000;
		else if(val == 3 ) rate = 50000;
		else if(val == 4 ) rate = 70000;
		else if(val == 5 ) rate = 100000;
	}else if(kind=="T" && use=="G"){	// 화물 비영업용
		if(val <= 1000) rate = 28500;
		else if(val <=2000 ) rate = 34500;
		else if(val <=3000 ) rate = 48000;
		else if(val <=4000 ) rate = 63000;
		else if(val <=5000 ) rate = 79500;
		else if(val <=8000 ) rate = 130500;
		else if(val <=10000 ) rate = 157500;
		else{
			rate = 157500;
			rate +=  number_cut((val - 10000)/10000, 1, "ceil") * 30000;
		}
	}else if(kind=="T" && use=="O"){	// 화물 비영업용
		if(val <= 1000) rate = 6600;
		else if(val <=2000 ) rate = 9600;
		else if(val <=3000 ) rate = 13500;
		else if(val <=4000 ) rate = 18000;
		else if(val <=5000 ) rate = 22500;
		else if(val <=8000 ) rate = 36000;
		else if(val <=10000 ) rate = 45000;
		else{
			rate = 157500;
			rate +=  number_cut((val - 10000)/10000, 1, "ceil") * 10000;
		}
	}else if(kind=="S" && use=="G"){	// 특수 비영업용
		if(val == 1) rate = 58500;
		else if(val == 2 ) rate = 157500;
	}else if(kind=="S" && use=="O"){	// 특수 영업용
		if(val == 1) rate = 13500;
		else if(val == 2 ) rate = 36000;
	}else if(kind=="M" && use=="G"){	// 3륜이하 비영업용
		rate = 18000;
	}else if(kind=="M" && use=="O"){	// 3륜이하 영업용
		rate = 3300;
	}
	rate = number_cut(rate/2, 10, "floor");

	if(kind == "P" && use == "G"){
		var taxE = number_cut(rate * 0.3, 10, "floor");
		var rateY = (rate + taxE) * 2;
	}else{
		var rateY = rate * 2;
	}
	
	return [rate, rateY];
}

function calculatorDeliveryInsure(kind,val,brand){	// 의무 보험료
	var rate = 0;
	if(brand==111 || brand==112 || brand==121){
		if(kind=="P" && val<7) rate = 2300;
		else if(kind=="P") rate = 3100;
		else if(kind=="B" && val<=25) rate = 3800;
		else if(kind=="B") rate = 5700;	// 카운티 29인승
		else if(kind=="T" && val<=1000) rate = 3400;	// 포터/봉고 3400
		else if(kind=="T") rate = 3000;	// 마이티/메가트럭 3000
	}else if(brand==131){	// 20190208 수정
		if(kind=="P" && val<7) rate = 3710;
		else if(kind=="P") rate = 4370;
		else if(kind=="B") rate = 6110;
		else if(kind=="T") rate = 5190;
	}else if(brand==141){
		if(kind=="P" && val<7) rate = 3710;
		else if(kind=="P") rate = 4370;
		else if(kind=="B") rate = 6110;
		else if(kind=="T") rate = 5190;
	}
	return rate;
}
