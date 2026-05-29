// mapeamento dos nomes usados no projeto para os componentes do Lucide
import {
  Map, MapPin, Shield, Brain, Backpack, Key, Lock, LockOpen,
  Check, X, TriangleAlert, Wifi, Compass, Trophy, Search,
  Mouse, Route, BookOpen, Building2, Dumbbell, Hospital,
  Theater, Clapperboard, FlaskConical, Radio,
  ArrowRight, ArrowLeft,
} from 'lucide-react';

const ICONES = {
  mapa: Map,
  localizacao: MapPin,
  escudo: Shield,
  cerebro: Brain,
  mochila: Backpack,
  chave: Key,
  cadeado: Lock,
  destravado: LockOpen,
  check: Check,
  x: X,
  aviso: TriangleAlert,
  sinal: Wifi,
  bussola: Compass,
  trofeu: Trophy,
  lupa: Search,
  mouse: Mouse,
  rota: Route,
  livro: BookOpen,
  predio: Building2,
  halter: Dumbbell,
  hospital: Hospital,
  teatro: Theater,
  filme: Clapperboard,
  frasco: FlaskConical,
  radio: Radio,
  setaDireita: ArrowRight,
  setaEsquerda: ArrowLeft,
};

export default function Icone({ nome = 'mapa', className = '', size = 20 }) {
  const Componente = ICONES[nome] ?? Map;
  return <Componente size={size} className={className} aria-hidden="true" />;
}
