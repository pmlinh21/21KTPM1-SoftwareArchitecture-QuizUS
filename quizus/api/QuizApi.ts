import config from '@/constants/config';

export const getQuizInfo = async (id_campaign: string) => {
    try {
        const response = await fetch(`${config.CAMPAIGN_BE}/api/game/campaign/${id_campaign}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result)
            return result;
        } else {
            throw new Error('Failed to fetch data ', result.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data');
    }
}

export const getPlayerTurn = async (id_campaign: string) => {
    try {
        const response = await fetch(`${config.CAMPAIGN_BE}/api/user/player_turn/${id_campaign}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result)
            return result;
        } else {
            throw new Error('Failed to fetch data ', result.message);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data');
    }
}