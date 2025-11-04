import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);
  const wbot = getWbot(defaultWhatsapp.id);
  
  let phoneContacts;
  
  try {
    phoneContacts = await wbot.getContacts();
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
    return;
  }
  
  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (!number) {
          return null;
        }
        
        if (!name) {
          name = number;
        }
        
        try {
          // Usa findOrCreate para evitar duplicados
          const [contact, created] = await Contact.findOrCreate({
            where: { number },
            defaults: { name, isGroup: false }
          });
          
          if (created) {
            logger.info(`Contato importado: ${name} (${number})`);
          } else {
            logger.debug(`Contato já existe: ${number}`);
          }
          
          return contact;
        } catch (err) {
          logger.error(`Erro ao importar contato ${number}: ${err}`);
          return null;
        }
      })
    );
  }
};

export default ImportContactsService;