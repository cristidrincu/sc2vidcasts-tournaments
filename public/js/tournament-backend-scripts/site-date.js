(function () {
    var getDate = function(){
        var date = new Date();
        var day = date.getDay();
        var currentDateDay = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        var dayStrings = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
        var yearMonths = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
        var currentDay = '';
        var currentMonth = '';

        switch(day){
            case 0:
                currentDay = dayStrings[0];
                break;
            case 1:
                currentDay = dayStrings[1];
                break;
            case 2:
                currentDay = dayStrings[2];
                break;
            case 3:
                currentDay = dayStrings[3];
                break;
            case 4:
                currentDay = dayStrings[4];
                break;
            case 5:
                currentDay = dayStrings[5];
                break;
            case 6:
                currentDay = dayStrings[6];
                break;

                return currentDay;
        }

        switch(month){
            case 0:
                currentMonth = yearMonths[0];
                break;
            case 1:
                currentMonth = yearMonths[1];
                break;
            case 2:
                currentMonth = yearMonths[2];
                break;
            case 3:
                currentMonth = yearMonths[3];
                break;
            case 4:
                currentMonth = yearMonths[4];
                break;
            case 5:
                currentMonth = yearMonths[5];
                break;
            case 6:
                currentMonth = yearMonths[6];
                break;
            case 7:
                currentMonth = yearMonths[7];
                break;
            case 8:
                currentMonth = yearMonths[8];
                break;
            case 9:
                currentMonth = yearMonths[9];
                break;
            case 10:
                currentMonth = yearMonths[10];
                break;
            case 11:
                currentMonth = yearMonths[11];
                break;

                return currentMonth;
        }

        return 'Astazi este: ' + currentDay + ', ' + currentDateDay + ' ' + currentMonth + ' ' + year;
    };


    document.getElementById('dateParagraph').innerHTML = getDate();
}());


