import { Line, Doughnut, Bar } from 'react-chartjs-2';

import { 
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function WeeklyRegisteredUsers({ registeredUsers }) {
    const data = {
        labels: ['hace 1 día', 'hace 2 día', 'hace 3 día', 'hace 4 día', 'hace 5 día', 'hace 6 día', 'hace 7 día'],
        datasets: [{
            label: 'Usuarios registrados',
            data: registeredUsers,
            backgroundColor: [
                '#0F4C75',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                '#00FFFF22',
                '#00ff1522',
                '#8a000022',
                '#4c008a22',
                '#005a8a22'
            ],
            borderColor: [
                '#0F4C7555',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                '#00FFFF',
                '#00ff15',
                '#8a0000',
                '#4c008a',
                '#005a8a'
            ],
            borderWidth: 2,
            pointRadius: 6
        }]
    };

    return <Line data={data}/>
}

export function UserState ({ state }){
    const data = {
        labels: ['Libre', 'Suspendidos', 'Bloqueado'],
        datasets: [{
            label: 'Estado de usuario',
            data: state,
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                '#8a000022'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                '#8a0000'
            ],
            borderWidth: 2
        }]
    };

    return <Doughnut data={data} />
}

export function PublishedProducts({ currentProducts, lastProducts }) {
    const data = {
        labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
            label: 'Publicaciones de la semana',
            data: currentProducts,
            backgroundColor: ['#005a8a22'],
            borderColor: ['#005a8a'],
            borderWidth: 2,
            pointRadius: 6
        },{
            label: 'Publicaciones de la semana pasada',
            data: lastProducts,
            backgroundColor: ['#ffa60022'],
            borderColor: ['#ffa600'],
            borderWidth: 2,
            pointRadius: 6
        }]
    };

    return <Bar data={data} height={(window.screen.width > 600) ? 80 : 220} />
}