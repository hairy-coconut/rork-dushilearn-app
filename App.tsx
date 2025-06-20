import 'expo-router/entry';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { Slot } from 'expo-router';

export default function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <Slot />
            </UserProvider>
        </ThemeProvider>
    );
}
